import "server-only";
import { eq, sql } from "drizzle-orm";
import {
  canTransitionOrderStatus,
  type OrderStatus,
  type WalletTransactionType,
} from "@/contracts/patra-tani.contract";
import type { DbTransaction } from "@/db";
import { orders, users, walletTransactions } from "@/db/schema";
import { AppError } from "@/lib/action-handler";

/*
 * Order + escrow building blocks shared by order and admin actions.
 * Kept out of "use server" files so none of these become client-callable.
 * Every function expects to run inside `db.transaction()`.
 *
 * Ledger convention (`wallet_transactions`):
 * - userId set  → mirrors a change to that user's `walletBalanceIdr`.
 * - userId null → platform-side bookkeeping (sandbox escrow intake, commission).
 * The unique index on (orderId, type, userId) makes each movement idempotent.
 */

export type OrderRow = typeof orders.$inferSelect;
export type OrderSide = "FARMER" | "BUYER";

/** Reads the order with a row lock; serializes all lifecycle actions on it. */
export async function lockOrder(tx: DbTransaction, orderId: string): Promise<OrderRow> {
  const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
  if (!order) throw new AppError("NOT_FOUND", "Pesanan tidak ditemukan.");
  return order;
}

/** Which side of the order the user is on; FORBIDDEN for outsiders. */
export function getOrderSide(order: OrderRow, userId: string): OrderSide {
  if (order.farmerId === userId) return "FARMER";
  if (order.buyerId === userId) return "BUYER";
  throw new AppError("FORBIDDEN", "Anda bukan pihak dalam pesanan ini.");
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrderStatus(from, to)) {
    throw new AppError(
      "INVALID_STATE_TRANSITION",
      `Pesanan berstatus ${from} tidak dapat diubah menjadi ${to}.`,
    );
  }
}

async function recordLedger(
  tx: DbTransaction,
  entry: {
    userId: string | null;
    orderId: string;
    type: WalletTransactionType;
    amountIdr: number;
    description: string;
  },
): Promise<void> {
  await tx.insert(walletTransactions).values(entry);
}

async function creditWallet(
  tx: DbTransaction,
  entry: { userId: string; orderId: string; type: WalletTransactionType; amountIdr: number; description: string },
): Promise<void> {
  await tx
    .update(users)
    .set({ walletBalanceIdr: sql`${users.walletBalanceIdr} + ${entry.amountIdr}` })
    .where(eq(users.id, entry.userId));
  await recordLedger(tx, entry);
}

/** Sandbox: records the exact escrow amount entering the platform. */
export async function recordEscrowHold(tx: DbTransaction, order: OrderRow, reference: string) {
  await recordLedger(tx, {
    userId: null,
    orderId: order.id,
    type: "ESCROW_HOLD",
    amountIdr: order.totalEscrowHeldIdr,
    description: `Sandbox payment ${reference} for ${order.orderCode}`,
  });
}

/**
 * Pays the farmer `netFarmerPayoutIdr` = subtotal − 4% commission + 100% delivery fee,
 * and books the commission (harvest subtotal only) to the platform.
 */
export async function releaseEscrowToFarmer(tx: DbTransaction, order: OrderRow) {
  await creditWallet(tx, {
    userId: order.farmerId,
    orderId: order.id,
    type: "PAYOUT_RELEASE",
    amountIdr: order.netFarmerPayoutIdr,
    description: `Payout ${order.orderCode}`,
  });
  await recordLedger(tx, {
    userId: null,
    orderId: order.id,
    type: "PLATFORM_COMMISSION",
    amountIdr: order.platformCommissionIdr,
    description: `Commission ${order.orderCode}`,
  });
}

/** Refunds 100% of `totalEscrowHeldIdr` to the buyer's wallet. No partial refunds. */
export async function refundEscrowToBuyer(tx: DbTransaction, order: OrderRow) {
  await creditWallet(tx, {
    userId: order.buyerId,
    orderId: order.id,
    type: "ESCROW_REFUND",
    amountIdr: order.totalEscrowHeldIdr,
    description: `Refund ${order.orderCode}`,
  });
}
