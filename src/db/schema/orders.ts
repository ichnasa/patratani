import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  deliveryMethodEnum,
  disputeResolutionEnum,
  orderStatusEnum,
  userRoleEnum,
  walletTransactionTypeEnum,
} from "./enums";
import { bids, marketPosts } from "./market";

/*
 * Created when a bid/pre-order is accepted (AWARDED). Weight and all IDR
 * amounts are fixed from that point; check constraints enforce the math.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Human-readable code, e.g. "PT-20261024-8F3K". */
    orderCode: text("order_code").notNull().unique(),
    postId: uuid("post_id")
      .notNull()
      .references(() => marketPosts.id, { onDelete: "restrict" }),
    bidId: uuid("bid_id")
      .notNull()
      .unique()
      .references(() => bids.id, { onDelete: "restrict" }),
    farmerId: text("farmer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("AWARDED"),

    fixedWeightKg: integer("fixed_weight_kg").notNull(),
    agreedPricePerKgIdr: integer("agreed_price_per_kg_idr").notNull(),
    deliveryMethod: deliveryMethodEnum("delivery_method").notNull(),
    subtotalHarvestIdr: integer("subtotal_harvest_idr").notNull(),
    deliveryFeeIdr: integer("delivery_fee_idr").notNull().default(0),
    totalEscrowHeldIdr: integer("total_escrow_held_idr").notNull(),
    platformCommissionIdr: integer("platform_commission_idr").notNull(),
    netFarmerPayoutIdr: integer("net_farmer_payout_idr").notNull(),

    /** null = awaiting H-1 answer, true = ready, false = canceled at H-1. */
    isH1Confirmed: boolean("is_h1_confirmed"),
    h1Notes: text("h1_notes"),
    h1ConfirmedAt: timestamp("h1_confirmed_at", { withTimezone: true }),

    farmerConfirmedComplete: boolean("farmer_confirmed_complete").notNull().default(false),
    buyerConfirmedComplete: boolean("buyer_confirmed_complete").notNull().default(false),

    paidAt: timestamp("paid_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("orders_farmer_id_status_idx").on(t.farmerId, t.status),
    index("orders_buyer_id_status_idx").on(t.buyerId, t.status),
    index("orders_post_id_idx").on(t.postId),
    check("orders_weight_positive", sql`${t.fixedWeightKg} > 0`),
    check(
      "orders_subtotal_math",
      sql`${t.subtotalHarvestIdr} = ${t.fixedWeightKg} * ${t.agreedPricePerKgIdr}`,
    ),
    check(
      "orders_escrow_math",
      sql`${t.totalEscrowHeldIdr} = ${t.subtotalHarvestIdr} + ${t.deliveryFeeIdr}`,
    ),
    check(
      "orders_payout_math",
      sql`${t.netFarmerPayoutIdr} = ${t.subtotalHarvestIdr} - ${t.platformCommissionIdr} + ${t.deliveryFeeIdr}`,
    ),
    check(
      "orders_self_pickup_free",
      sql`${t.deliveryMethod} <> 'SELF_PICKUP' or ${t.deliveryFeeIdr} = 0`,
    ),
    check("orders_distinct_parties", sql`${t.farmerId} <> ${t.buyerId}`),
  ],
).enableRLS();

/** Live webcam photo with burned-in timestamp + GPS. Stored in `handover-evidence`. */
export const handoverEvidences = pgTable(
  "handover_evidences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    uploadedByUserId: text("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    uploadedByRole: userRoleEnum("uploaded_by_role").notNull(),
    /** Object path inside the bucket, used to mint signed URLs. */
    storagePath: text("storage_path").notNull(),
    photoUrl: text("photo_url").notNull(),
    capturedLatitude: doublePrecision("captured_latitude").notNull(),
    capturedLongitude: doublePrecision("captured_longitude").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("handover_evidences_order_id_idx").on(t.orderId)],
).enableRLS();

/** One dispute per order. Resolution is all-or-nothing (no partial refunds). */
export const disputes = pgTable(
  "disputes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    openedByUserId: text("opened_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason").notNull(),
    evidenceUrls: text("evidence_urls").array().notNull().default(sql`'{}'::text[]`),
    resolution: disputeResolutionEnum("resolution"),
    adminNotes: text("admin_notes"),
    resolvedByAdminId: text("resolved_by_admin_id").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("disputes_unresolved_idx").on(t.createdAt).where(sql`${t.resolution} is null`),
    check(
      "disputes_resolution_complete",
      sql`(${t.resolution} is null) = (${t.resolvedAt} is null)`,
    ),
  ],
).enableRLS();

/** Each party may review the other once per COMPLETED order. */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    revieweeId: text("reviewee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("reviews_one_per_reviewer_per_order").on(t.orderId, t.reviewerId),
    index("reviews_reviewee_id_idx").on(t.revieweeId),
    check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
    check("reviews_not_self", sql`${t.reviewerId} <> ${t.revieweeId}`),
  ],
).enableRLS();

/**
 * Append-only ledger behind `users.walletBalanceIdr`. Signed amounts:
 * negative = debit, positive = credit. `userId` null = platform account
 * (PLATFORM_COMMISSION rows).
 */
export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "restrict" }),
    type: walletTransactionTypeEnum("type").notNull(),
    amountIdr: integer("amount_idr").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("wallet_transactions_user_id_idx").on(t.userId, t.createdAt),
    index("wallet_transactions_order_id_idx").on(t.orderId),
    // Each order-linked money movement happens at most once (idempotency guard).
    // coalesce() makes the platform account (null userId) participate in the key.
    uniqueIndex("wallet_transactions_once_per_order")
      .on(t.orderId, t.type, sql`coalesce(${t.userId}, '')`)
      .where(sql`${t.orderId} is not null`),
  ],
).enableRLS();
