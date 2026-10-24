"use server";

import { count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ConfirmH1ReadinessInputSchema,
  HANDOVER_PHOTO_MAX_AGE_MINUTES,
  MAX_HANDOVER_PHOTOS_PER_ORDER,
  RaiseDisputeInputSchema,
  SubmitReviewInputSchema,
  UploadHandoverEvidenceInputSchema,
  type UserRole,
} from "@/contracts/patra-tani.contract";
import { db } from "@/db";
import {
  disputes,
  handoverEvidences,
  marketPosts,
  orders,
  reviews,
  users,
} from "@/db/schema";
import { AppError, safeActionClient } from "@/lib/action-handler";
import { requireAuth } from "@/lib/auth-guard";
import {
  assertTransition,
  getOrderSide,
  lockOrder,
  recordEscrowHold,
  refundEscrowToBuyer,
  releaseEscrowToFarmer,
} from "@/lib/escrow";
import {
  removeHandoverEvidencePhoto,
  uploadHandoverEvidencePhoto,
} from "@/lib/supabase-storage";

const OrderIdSchema = z.string().uuid("ID pesanan tidak valid.");
/** Allowed clock skew between the capturing device and the server. */
const CLOCK_SKEW_MS = 2 * 60 * 1000;

/* ------------------------------ UC-08: Payment ----------------------------- */

/** BUYER pays the exact `totalEscrowHeldIdr` (sandbox). AWARDED → PAID_HELD. */
export const payEscrowSandboxAction = safeActionClient(OrderIdSchema, async (orderId) => {
  const user = await requireAuth(["BUYER"]);

  const result = await db.transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    if (getOrderSide(order, user.id) !== "BUYER") {
      throw new AppError("FORBIDDEN", "Hanya pembeli yang dapat membayar pesanan ini.");
    }
    assertTransition(order.status, "PAID_HELD");

    const reference = `SANDBOX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await recordEscrowHold(tx, order, reference);
    await tx
      .update(orders)
      .set({ status: "PAID_HELD", paidAt: new Date() })
      .where(eq(orders.id, order.id));

    return { orderId: order.id, status: "PAID_HELD" as const, paidAmountIdr: order.totalEscrowHeldIdr, reference };
  });

  revalidatePath("/", "layout");
  return result;
});

/* ---------------------------- UC-09: H-1 readiness ------------------------- */

const confirmH1Readiness = safeActionClient(ConfirmH1ReadinessInputSchema, async (input) => {
  const user = await requireAuth(["FARMER"]);

  const result = await db.transaction(async (tx) => {
    const order = await lockOrder(tx, input.orderId);
    if (getOrderSide(order, user.id) !== "FARMER") {
      throw new AppError("FORBIDDEN", "Hanya petani pesanan ini yang dapat konfirmasi H-1.");
    }
    if (order.status !== "PAID_HELD") {
      throw new AppError("INVALID_STATE_TRANSITION", "Konfirmasi H-1 hanya untuk pesanan yang sudah dibayar.");
    }
    // One-shot: once the farmer commits, the buyer can rely on it.
    if (order.isH1Confirmed !== null) {
      throw new AppError("CONFLICT", "Konfirmasi H-1 sudah diberikan.");
    }

    const now = new Date();
    if (input.isReady) {
      await tx
        .update(orders)
        .set({ isH1Confirmed: true, h1Notes: input.notes ?? null, h1ConfirmedAt: now })
        .where(eq(orders.id, order.id));
      return { orderId: order.id, status: "PAID_HELD" as const, isH1Confirmed: true };
    }

    assertTransition(order.status, "CANCELED_H1");
    await tx
      .update(orders)
      .set({
        status: "CANCELED_H1",
        isH1Confirmed: false,
        h1Notes: input.notes ?? null,
        h1ConfirmedAt: now,
        canceledAt: now,
      })
      .where(eq(orders.id, order.id));

    // Return the fixed weight to the post. A buyer's tender reopens so other
    // farmers can still fill it; a farmer's etalase keeps its open/closed state.
    await tx
      .update(marketPosts)
      .set({
        remainingQuotaKg: sql`${marketPosts.remainingQuotaKg} + ${order.fixedWeightKg}`,
        isOpen: sql`case when ${marketPosts.type} = 'TENDER_PERMINTAAN' then true else ${marketPosts.isOpen} end`,
      })
      .where(eq(marketPosts.id, order.postId));

    await refundEscrowToBuyer(tx, order);
    return {
      orderId: order.id,
      status: "CANCELED_H1" as const,
      isH1Confirmed: false,
      refundedIdr: order.totalEscrowHeldIdr,
    };
  });

  revalidatePath("/", "layout");
  return result;
});

/**
 * FARMER confirms readiness at H-1. `isReady: false` cancels (CANCELED_H1),
 * restores quota and refunds 100% of escrow to the buyer's wallet.
 */
export async function confirmH1ReadinessAction(orderId: string, isReady: boolean, notes?: string) {
  return confirmH1Readiness({ orderId, isReady, notes });
}

/* --------------------------- UC-10: Geotag handover ------------------------ */

const HandoverFormSchema = z.preprocess(
  (value) => (value instanceof FormData ? Object.fromEntries(value.entries()) : value),
  UploadHandoverEvidenceInputSchema,
);

function assertCanUploadHandover(order: typeof orders.$inferSelect) {
  const ready = order.status === "PAID_HELD" && order.isH1Confirmed === true;
  if (!ready && order.status !== "HANDOVER") {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      "Foto serah terima hanya bisa diunggah setelah petani konfirmasi siap H-1.",
    );
  }
}

const uploadHandoverGeotagPhoto = safeActionClient(HandoverFormSchema, async (input) => {
  const user = await requireAuth(["FARMER", "BUYER"]);

  const capturedMs = input.capturedAt.getTime();
  const now = Date.now();
  if (capturedMs > now + CLOCK_SKEW_MS || now - capturedMs > HANDOVER_PHOTO_MAX_AGE_MINUTES * 60_000) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Foto harus diambil langsung (maksimal ${HANDOVER_PHOTO_MAX_AGE_MINUTES} menit sebelum diunggah).`,
      { capturedAt: ["Waktu pengambilan foto tidak valid."] },
    );
  }

  // Cheap pre-check before uploading; re-checked under lock below.
  const current = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
  if (!current) throw new AppError("NOT_FOUND", "Pesanan tidak ditemukan.");
  getOrderSide(current, user.id);
  assertCanUploadHandover(current);

  // Upload outside the transaction so a slow network never holds the row lock.
  const uploaded = await uploadHandoverEvidencePhoto({
    orderId: input.orderId,
    userId: user.id,
    fileBlob: input.photo,
  });

  try {
    const result = await db.transaction(async (tx) => {
      const order = await lockOrder(tx, input.orderId);
      getOrderSide(order, user.id);
      assertCanUploadHandover(order);

      const [{ photoCount }] = await tx
        .select({ photoCount: count() })
        .from(handoverEvidences)
        .where(eq(handoverEvidences.orderId, order.id));
      if (photoCount >= MAX_HANDOVER_PHOTOS_PER_ORDER) {
        throw new AppError("CONFLICT", `Maksimal ${MAX_HANDOVER_PHOTOS_PER_ORDER} foto per pesanan.`);
      }

      const [evidence] = await tx
        .insert(handoverEvidences)
        .values({
          orderId: order.id,
          uploadedByUserId: user.id,
          uploadedByRole: user.role as UserRole,
          storagePath: uploaded.storagePath,
          photoUrl: uploaded.signedUrl,
          capturedLatitude: input.capturedLatitude,
          capturedLongitude: input.capturedLongitude,
          capturedAt: input.capturedAt,
        })
        .returning({ id: handoverEvidences.id });

      if (order.status === "PAID_HELD") {
        assertTransition(order.status, "HANDOVER");
        await tx.update(orders).set({ status: "HANDOVER" }).where(eq(orders.id, order.id));
      }

      return {
        evidenceId: evidence.id,
        orderId: order.id,
        status: "HANDOVER" as const,
        photoUrl: uploaded.signedUrl,
      };
    });

    revalidatePath("/", "layout");
    return result;
  } catch (err) {
    await removeHandoverEvidencePhoto(uploaded.storagePath);
    throw err;
  }
});

/**
 * FARMER or BUYER uploads a live webcam photo with GPS + timestamp.
 * FormData fields: orderId, photo, capturedLatitude, capturedLongitude, capturedAt (ISO).
 * PAID_HELD (H-1 confirmed) → HANDOVER; further photos allowed while HANDOVER.
 */
export async function uploadHandoverGeotagPhotoAction(formData: FormData) {
  return uploadHandoverGeotagPhoto(formData);
}

/* ------------------------- UC-11: Dual confirmation ------------------------ */

/**
 * Each side confirms completion. When both have confirmed: HANDOVER → COMPLETED
 * and the farmer is credited `netFarmerPayoutIdr`. Repeat calls are idempotent.
 */
export const confirmOrderCompleteAction = safeActionClient(OrderIdSchema, async (orderId) => {
  const user = await requireAuth(["FARMER", "BUYER"]);

  const result = await db.transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    const side = getOrderSide(order, user.id);
    if (order.status !== "HANDOVER") {
      throw new AppError("INVALID_STATE_TRANSITION", "Pesanan belum dalam tahap serah terima.");
    }

    const [{ photoCount }] = await tx
      .select({ photoCount: count() })
      .from(handoverEvidences)
      .where(eq(handoverEvidences.orderId, order.id));
    if (photoCount === 0) {
      throw new AppError("CONFLICT", "Unggah foto serah terima bergeotag terlebih dahulu.");
    }

    const farmerConfirmedComplete = order.farmerConfirmedComplete || side === "FARMER";
    const buyerConfirmedComplete = order.buyerConfirmedComplete || side === "BUYER";
    const completes = farmerConfirmedComplete && buyerConfirmedComplete;

    if (completes) assertTransition(order.status, "COMPLETED");
    await tx
      .update(orders)
      .set({
        farmerConfirmedComplete,
        buyerConfirmedComplete,
        ...(completes ? { status: "COMPLETED" as const, completedAt: new Date() } : {}),
      })
      .where(eq(orders.id, order.id));

    if (completes) await releaseEscrowToFarmer(tx, order);

    return {
      orderId: order.id,
      status: completes ? ("COMPLETED" as const) : ("HANDOVER" as const),
      farmerConfirmedComplete,
      buyerConfirmedComplete,
      farmerPayoutIdr: completes ? order.netFarmerPayoutIdr : 0,
    };
  });

  revalidatePath("/", "layout");
  return result;
});

/* ------------------------------ UC-12: Dispute ----------------------------- */

const raiseDispute = safeActionClient(RaiseDisputeInputSchema, async (input) => {
  const user = await requireAuth(["FARMER", "BUYER"]);

  const result = await db.transaction(async (tx) => {
    const order = await lockOrder(tx, input.orderId);
    getOrderSide(order, user.id);
    if (order.status !== "PAID_HELD" && order.status !== "HANDOVER") {
      throw new AppError(
        "INVALID_STATE_TRANSITION",
        "Sengketa hanya dapat diajukan saat dana ditahan atau saat serah terima.",
      );
    }
    assertTransition(order.status, "DISPUTED");

    const [dispute] = await tx
      .insert(disputes)
      .values({ orderId: order.id, openedByUserId: user.id, reason: input.reason })
      .returning({ id: disputes.id });
    // Escrow stays held: no wallet movement until an admin resolves it.
    await tx.update(orders).set({ status: "DISPUTED" }).where(eq(orders.id, order.id));

    return { disputeId: dispute.id, orderId: order.id, status: "DISPUTED" as const };
  });

  revalidatePath("/", "layout");
  return result;
});

/** FARMER or BUYER freezes a PAID_HELD/HANDOVER order for admin review. */
export async function raiseDisputeAction(orderId: string, reason: string) {
  return raiseDispute({ orderId, reason });
}

/* ------------------------------ UC-13: Review ------------------------------ */

/** Each party reviews the other once, only after COMPLETED. */
export const submitReviewAction = safeActionClient(SubmitReviewInputSchema, async (input) => {
  const user = await requireAuth(["FARMER", "BUYER"]);

  const result = await db.transaction(async (tx) => {
    const order = await lockOrder(tx, input.orderId);
    const side = getOrderSide(order, user.id);
    if (order.status !== "COMPLETED") {
      throw new AppError("INVALID_STATE_TRANSITION", "Ulasan hanya untuk pesanan yang sudah selesai.");
    }
    const revieweeId = side === "FARMER" ? order.buyerId : order.farmerId;

    // Duplicate reviews are rejected by reviews_one_per_reviewer_per_order.
    const [review] = await tx
      .insert(reviews)
      .values({
        orderId: order.id,
        reviewerId: user.id,
        revieweeId,
        rating: input.rating,
        comment: input.comment ?? null,
      })
      .returning({ id: reviews.id });

    // Incremental average; both SET expressions read the pre-update row.
    const [reviewee] = await tx
      .update(users)
      .set({
        ratingAvg: sql`(${users.ratingAvg} * ${users.ratingCount} + ${input.rating}) / (${users.ratingCount} + 1)`,
        ratingCount: sql`${users.ratingCount} + 1`,
      })
      .where(eq(users.id, revieweeId))
      .returning({ ratingAvg: users.ratingAvg, ratingCount: users.ratingCount });

    return { reviewId: review.id, revieweeId, ...reviewee };
  });

  revalidatePath("/", "layout");
  return result;
});
