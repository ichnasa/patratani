"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CreateMarketPostInputSchema,
  SubmitBidOrPreOrderInputSchema,
  calculateOrderSettlement,
  type GeoPoint,
} from "@/contracts/patra-tani.contract";
import { db, type DB, type DbTransaction } from "@/db";
import { bids, farmerDeliveryConfigs, marketPosts, orders, users } from "@/db/schema";
import { AppError, safeActionClient } from "@/lib/action-handler";
import { requireAuth } from "@/lib/auth-guard";
import {
  isWithinFarmerDeliveryRules,
  toFarmerDeliveryConfig,
  type FarmerDeliveryEligibility,
} from "@/lib/geo";

/** Postgres `integer` upper bound; IDR columns are int4. */
const INT4_MAX = 2_147_483_647;

type Executor = DB | DbTransaction;
type MarketPostRow = typeof marketPosts.$inferSelect;

/* --------------------------------- Helpers -------------------------------- */

function deliveryViolationMessage(
  result: Extract<FarmerDeliveryEligibility, { allowed: false }>,
  config: { minCapacityKg: number; maxCapacityKg: number; maxRadiusKm: number } | null,
): string {
  switch (result.reason) {
    case "DELIVERY_DISABLED":
      return "Petani ini tidak menyediakan layanan antar. Pilih ambil sendiri (SELF_PICKUP).";
    case "BELOW_MIN_CAPACITY":
      return `Layanan antar petani minimal ${config?.minCapacityKg} kg.`;
    case "ABOVE_MAX_CAPACITY":
      return `Layanan antar petani maksimal ${config?.maxCapacityKg} kg.`;
    case "OUTSIDE_RADIUS":
      return `Jarak ${result.distanceKm?.toFixed(1)} km melebihi radius antar petani (${config?.maxRadiusKm} km).`;
  }
}

/**
 * Checks FARMER_DELIVERY against the farmer's current config.
 * Throws OUT_OF_DELIVERY_RANGE when any rule fails.
 */
async function assertFarmerDelivery(
  executor: Executor,
  params: { farmerId: string; weightKg: number; farmerPoint: GeoPoint; dropOffPoint: GeoPoint },
): Promise<{ deliveryFeeIdr: number; distanceKm: number }> {
  const row = await executor.query.farmerDeliveryConfigs.findFirst({
    where: eq(farmerDeliveryConfigs.userId, params.farmerId),
  });
  const config = toFarmerDeliveryConfig(row);
  const result = isWithinFarmerDeliveryRules({
    config,
    quantityKg: params.weightKg,
    farmerPoint: params.farmerPoint,
    dropOffPoint: params.dropOffPoint,
  });
  if (!result.allowed) {
    throw new AppError("OUT_OF_DELIVERY_RANGE", deliveryViolationMessage(result, config));
  }
  return { deliveryFeeIdr: result.deliveryFeeIdr, distanceKm: result.distanceKm };
}

/** Farmer's profile location: the origin for deliveries on TENDER_PERMINTAAN. */
async function getFarmerProfilePoint(executor: Executor, farmerId: string): Promise<GeoPoint> {
  const farmer = await executor.query.users.findFirst({
    where: eq(users.id, farmerId),
    columns: { latitude: true, longitude: true },
  });
  if (farmer?.latitude == null || farmer.longitude == null) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Lokasi petani belum diatur. Lengkapi profil (titik lokasi) sebelum memakai layanan antar.",
    );
  }
  return { latitude: farmer.latitude, longitude: farmer.longitude };
}

function assertPostAcceptingOffers(post: MarketPostRow) {
  const now = Date.now();
  if (!post.isOpen || post.remainingQuotaKg <= 0) {
    throw new AppError("CONFLICT", "Postingan ini sudah ditutup.");
  }
  if (post.type === "TENDER_PERMINTAAN" && post.biddingDeadline && post.biddingDeadline.getTime() <= now) {
    throw new AppError("CONFLICT", "Batas waktu penawaran tender sudah lewat.");
  }
  if (post.type === "ETALASE_PANEN" && post.harvestOrNeededDate.getTime() <= now) {
    throw new AppError("CONFLICT", "Pre-order ditutup karena tanggal panen sudah lewat.");
  }
}

function generateOrderCode(now = new Date()): string {
  const ymd = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `PT-${ymd}-${suffix}`;
}

/* --------------------------------- Actions -------------------------------- */

/**
 * UC-05: FARMER posts ETALASE_PANEN (fixed safe quota + fixed price);
 * BUYER posts TENDER_PERMINTAAN (requested kg + max budget per kg).
 */
export const createMarketPostAction = safeActionClient(CreateMarketPostInputSchema, async (input) => {
  const user = await requireAuth(
    input.postType === "ETALASE_PANEN" ? ["FARMER"] : ["BUYER"],
  );

  const common = {
    creatorId: user.id,
    type: input.postType,
    title: input.title,
    commodityName: input.commodityName,
    category: input.category,
    description: input.description ?? null,
    imageUrls: input.imageUrls,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
  };

  const values =
    input.postType === "ETALASE_PANEN"
      ? {
          ...common,
          totalQuotaKg: input.fixedSafeQuotaKg,
          remainingQuotaKg: input.fixedSafeQuotaKg,
          minOrderKg: input.minOrderKg,
          pricePerKgIdr: input.pricePerKgIdr,
          harvestOrNeededDate: input.estimatedHarvestDate,
        }
      : {
          ...common,
          totalQuotaKg: input.requestedQuantityKg,
          remainingQuotaKg: input.requestedQuantityKg,
          pricePerKgIdr: input.maxBudgetPerKgIdr,
          harvestOrNeededDate: input.neededByDate,
          biddingDeadline: input.biddingDeadline,
        };

  const [post] = await db.insert(marketPosts).values(values).returning({ id: marketPosts.id });

  revalidatePath("/", "layout");
  return { postId: post.id };
});

/**
 * UC-06: BUYER pre-orders on ETALASE_PANEN (at the fixed price) or FARMER
 * bids on TENDER_PERMINTAAN (own price, capped at the buyer's budget).
 * Delivery fee is computed here from the farmer's config, never from the client.
 */
export const submitBidOrPreOrderAction = safeActionClient(
  SubmitBidOrPreOrderInputSchema,
  async (input) => {
    const isPreOrder = input.kind === "PRE_ORDER";
    const user = await requireAuth(isPreOrder ? ["BUYER"] : ["FARMER"]);

    const post = await db.query.marketPosts.findFirst({
      where: eq(marketPosts.id, input.marketPostId),
    });
    if (!post) throw new AppError("NOT_FOUND", "Postingan tidak ditemukan.");
    if (post.type !== (isPreOrder ? "ETALASE_PANEN" : "TENDER_PERMINTAAN")) {
      throw new AppError("VALIDATION_ERROR", "Jenis penawaran tidak sesuai dengan jenis postingan.");
    }
    if (post.creatorId === user.id) {
      throw new AppError("FORBIDDEN", "Tidak dapat menawar postingan sendiri.");
    }
    assertPostAcceptingOffers(post);

    if (input.quantityKg < post.minOrderKg) {
      throw new AppError("VALIDATION_ERROR", `Minimal ${post.minOrderKg} kg untuk postingan ini.`, {
        quantityKg: [`Minimal ${post.minOrderKg} kg.`],
      });
    }
    if (input.quantityKg > post.remainingQuotaKg) {
      throw new AppError("QUOTA_EXCEEDED", `Sisa kuota hanya ${post.remainingQuotaKg} kg.`, {
        quantityKg: [`Maksimal ${post.remainingQuotaKg} kg.`],
      });
    }

    let offeredPricePerKgIdr: number;
    if (input.kind === "PRE_ORDER") {
      offeredPricePerKgIdr = post.pricePerKgIdr;
    } else {
      if (input.offeredPricePerKgIdr > post.pricePerKgIdr) {
        throw new AppError("VALIDATION_ERROR", "Harga penawaran melebihi anggaran pembeli.", {
          offeredPricePerKgIdr: [`Maksimal Rp${post.pricePerKgIdr.toLocaleString("id-ID")}/kg.`],
        });
      }
      offeredPricePerKgIdr = input.offeredPricePerKgIdr;
    }

    let deliveryFeeIdr = 0;
    let distanceKm: number | null = null;
    let dropOff: { address: string; latitude: number; longitude: number } | null = null;

    if (input.deliveryMethod === "FARMER_DELIVERY") {
      const postPoint = { latitude: post.latitude, longitude: post.longitude };
      // PRE_ORDER: goods leave the farm (post location) for the buyer's drop-off.
      // TENDER_BID: goods leave the farmer's profile location for the tender location.
      const farmerId = isPreOrder ? post.creatorId : user.id;
      const farmerPoint = isPreOrder ? postPoint : await getFarmerProfilePoint(db, user.id);
      dropOff =
        input.kind === "PRE_ORDER"
          ? {
              // Presence guaranteed by SubmitBidOrPreOrderInputSchema.
              address: input.deliveryAddress!,
              latitude: input.deliveryLatitude!,
              longitude: input.deliveryLongitude!,
            }
          : { address: post.address, ...postPoint };

      const delivery = await assertFarmerDelivery(db, {
        farmerId,
        weightKg: input.quantityKg,
        farmerPoint,
        dropOffPoint: dropOff,
      });
      deliveryFeeIdr = delivery.deliveryFeeIdr;
      distanceKm = delivery.distanceKm;
    }

    const subtotalHarvestIdr = input.quantityKg * offeredPricePerKgIdr;
    if (subtotalHarvestIdr + deliveryFeeIdr > INT4_MAX) {
      throw new AppError("VALIDATION_ERROR", "Nilai transaksi terlalu besar. Bagi menjadi beberapa pesanan.");
    }

    const [bid] = await db
      .insert(bids)
      .values({
        postId: post.id,
        bidderId: user.id,
        weightKg: input.quantityKg,
        offeredPricePerKgIdr,
        deliveryMethod: input.deliveryMethod,
        deliveryFeeIdr,
        deliveryAddress: dropOff?.address ?? null,
        deliveryLatitude: dropOff?.latitude ?? null,
        deliveryLongitude: dropOff?.longitude ?? null,
        distanceKm,
        notes: input.notes ?? null,
      })
      .returning({ id: bids.id });

    revalidatePath("/", "layout");
    return {
      bidId: bid.id,
      subtotalHarvestIdr,
      deliveryFeeIdr,
      totalIdr: subtotalHarvestIdr + deliveryFeeIdr,
    };
  },
);

/**
 * UC-07: post owner accepts a PENDING bid. Atomically locks the post row,
 * deducts quota, fixes all nominals and creates the AWARDED order.
 * ETALASE_PANEN → owner is the FARMER; TENDER_PERMINTAAN → owner is the BUYER.
 */
export const acceptBidAndLockOrderAction = safeActionClient(
  z.string().uuid("ID penawaran tidak valid."),
  async (bidId) => {
    const user = await requireAuth(["FARMER", "BUYER"]);

    const result = await db.transaction(async (tx) => {
      const bidRef = await tx.query.bids.findFirst({
        where: eq(bids.id, bidId),
        columns: { postId: true },
      });
      if (!bidRef) throw new AppError("NOT_FOUND", "Penawaran tidak ditemukan.");

      // Lock order: post first, then bid. Every writer that touches a post's
      // bids holds the post lock first, so concurrent accepts cannot deadlock.
      const [post] = await tx
        .select()
        .from(marketPosts)
        .where(eq(marketPosts.id, bidRef.postId))
        .for("update");
      if (post.creatorId !== user.id) {
        throw new AppError("FORBIDDEN", "Hanya pemilik postingan yang dapat menerima penawaran.");
      }

      const [bid] = await tx.select().from(bids).where(eq(bids.id, bidId)).for("update");
      if (bid.status !== "PENDING") {
        throw new AppError("CONFLICT", "Penawaran ini sudah diproses.");
      }
      if (!post.isOpen) {
        throw new AppError("CONFLICT", "Postingan ini sudah ditutup.");
      }
      if (post.remainingQuotaKg < bid.weightKg) {
        throw new AppError(
          "QUOTA_EXCEEDED",
          `Sisa kuota ${post.remainingQuotaKg} kg tidak cukup untuk ${bid.weightKg} kg.`,
        );
      }

      const isPreOrder = post.type === "ETALASE_PANEN";
      const farmerId = isPreOrder ? post.creatorId : bid.bidderId;
      const buyerId = isPreOrder ? bid.bidderId : post.creatorId;

      let deliveryFeeIdr = 0;
      if (bid.deliveryMethod === "FARMER_DELIVERY") {
        if (bid.deliveryLatitude === null || bid.deliveryLongitude === null) {
          throw new AppError("CONFLICT", "Titik antar penawaran tidak lengkap.");
        }
        // Config may have changed since submission: re-check with current rules.
        const delivery = await assertFarmerDelivery(tx, {
          farmerId,
          weightKg: bid.weightKg,
          farmerPoint: isPreOrder
            ? { latitude: post.latitude, longitude: post.longitude }
            : await getFarmerProfilePoint(tx, farmerId),
          dropOffPoint: { latitude: bid.deliveryLatitude, longitude: bid.deliveryLongitude },
        });
        // The fee shown at submission is what the other party agreed to.
        if (delivery.deliveryFeeIdr !== bid.deliveryFeeIdr) {
          throw new AppError(
            "CONFLICT",
            "Ongkos antar petani berubah sejak penawaran diajukan. Penawaran perlu diajukan ulang.",
          );
        }
        deliveryFeeIdr = delivery.deliveryFeeIdr;
      }

      // 100% FIXED from here on. Commission applies to the harvest subtotal only.
      const subtotalHarvestIdr = bid.weightKg * bid.offeredPricePerKgIdr;
      const { totalEscrowHeldIdr, platformCommissionIdr, netFarmerPayoutIdr } =
        calculateOrderSettlement(subtotalHarvestIdr, deliveryFeeIdr);

      const remainingQuotaKg = post.remainingQuotaKg - bid.weightKg;
      const postClosed = remainingQuotaKg === 0;

      await tx
        .update(marketPosts)
        .set({ remainingQuotaKg, isOpen: !postClosed })
        .where(eq(marketPosts.id, post.id));

      await tx.update(bids).set({ status: "ACCEPTED" }).where(eq(bids.id, bid.id));
      if (postClosed) {
        await tx
          .update(bids)
          .set({ status: "REJECTED" })
          .where(and(eq(bids.postId, post.id), eq(bids.status, "PENDING")));
      }

      const [order] = await tx
        .insert(orders)
        .values({
          orderCode: generateOrderCode(),
          postId: post.id,
          bidId: bid.id,
          farmerId,
          buyerId,
          status: "AWARDED",
          fixedWeightKg: bid.weightKg,
          agreedPricePerKgIdr: bid.offeredPricePerKgIdr,
          deliveryMethod: bid.deliveryMethod,
          subtotalHarvestIdr,
          deliveryFeeIdr,
          totalEscrowHeldIdr,
          platformCommissionIdr,
          netFarmerPayoutIdr,
        })
        .returning({ id: orders.id, orderCode: orders.orderCode });

      return {
        orderId: order.id,
        orderCode: order.orderCode,
        postId: post.id,
        postClosed,
        remainingQuotaKg,
        subtotalHarvestIdr,
        deliveryFeeIdr,
        totalEscrowHeldIdr,
        platformCommissionIdr,
        netFarmerPayoutIdr,
      };
    });

    revalidatePath("/", "layout");
    return result;
  },
);
