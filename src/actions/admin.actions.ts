"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ResolveDisputeInputSchema } from "@/contracts/patra-tani.contract";
import { db } from "@/db";
import { disputes, orders } from "@/db/schema";
import { AppError, safeActionClient } from "@/lib/action-handler";
import { requireAuth } from "@/lib/auth-guard";
import {
  assertTransition,
  lockOrder,
  refundEscrowToBuyer,
  releaseEscrowToFarmer,
} from "@/lib/escrow";

/**
 * UC-14: ADMIN resolves a DISPUTED order after reviewing the geotagged photos
 * (see getOrderDetailQuery). All-or-nothing, no partial refunds:
 * - RELEASE_TO_FARMER → COMPLETED, farmer credited `netFarmerPayoutIdr`.
 * - REFUND_TO_BUYER   → REFUNDED, buyer credited 100% `totalEscrowHeldIdr`.
 */
export const resolveDisputeByAdminAction = safeActionClient(
  ResolveDisputeInputSchema,
  async (input) => {
    const admin = await requireAuth(["ADMIN"]);

    const result = await db.transaction(async (tx) => {
      const order = await lockOrder(tx, input.orderId);
      if (order.status !== "DISPUTED") {
        throw new AppError("INVALID_STATE_TRANSITION", "Pesanan ini tidak sedang dalam sengketa.");
      }

      const dispute = await tx.query.disputes.findFirst({
        where: eq(disputes.orderId, order.id),
      });
      if (!dispute) throw new AppError("NOT_FOUND", "Data sengketa tidak ditemukan.");
      if (dispute.resolution !== null) {
        throw new AppError("CONFLICT", "Sengketa ini sudah diputuskan.");
      }

      const now = new Date();
      const nextStatus = input.resolution === "RELEASE_TO_FARMER" ? "COMPLETED" : "REFUNDED";
      assertTransition(order.status, nextStatus);

      await tx
        .update(disputes)
        .set({
          resolution: input.resolution,
          adminNotes: input.adminNotes,
          resolvedByAdminId: admin.id,
          resolvedAt: now,
        })
        .where(eq(disputes.id, dispute.id));

      if (nextStatus === "COMPLETED") {
        await tx
          .update(orders)
          .set({ status: "COMPLETED", completedAt: now })
          .where(eq(orders.id, order.id));
        await releaseEscrowToFarmer(tx, order);
      } else {
        await tx
          .update(orders)
          .set({ status: "REFUNDED", canceledAt: now })
          .where(eq(orders.id, order.id));
        await refundEscrowToBuyer(tx, order);
      }

      return {
        orderId: order.id,
        disputeId: dispute.id,
        resolution: input.resolution,
        status: nextStatus,
        creditedUserId: nextStatus === "COMPLETED" ? order.farmerId : order.buyerId,
        creditedIdr:
          nextStatus === "COMPLETED" ? order.netFarmerPayoutIdr : order.totalEscrowHeldIdr,
      };
    });

    revalidatePath("/", "layout");
    return result;
  },
);
