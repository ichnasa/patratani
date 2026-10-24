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
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  bidStatusEnum,
  commodityCategoryEnum,
  deliveryMethodEnum,
  marketPostTypeEnum,
} from "./enums";

/*
 * One table for both market modes:
 * - ETALASE_PANEN (FARMER): totalQuotaKg = fixed safe quota,
 *   pricePerKgIdr = fixed price, harvestOrNeededDate = estimated harvest.
 * - TENDER_PERMINTAAN (BUYER): totalQuotaKg = requested kg,
 *   pricePerKgIdr = max budget per kg, harvestOrNeededDate = needed-by date.
 */
export const marketPosts = pgTable(
  "market_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: marketPostTypeEnum("type").notNull(),
    title: text("title").notNull(),
    commodityName: text("commodity_name").notNull(),
    category: commodityCategoryEnum("category").notNull(),
    description: text("description"),
    imageUrls: text("image_urls").array().notNull().default(sql`'{}'::text[]`),

    // Pickup point (etalase) or drop-off point (tender).
    address: text("address").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),

    totalQuotaKg: integer("total_quota_kg").notNull(),
    remainingQuotaKg: integer("remaining_quota_kg").notNull(),
    minOrderKg: integer("min_order_kg").notNull().default(10),
    pricePerKgIdr: integer("price_per_kg_idr").notNull(),
    harvestOrNeededDate: timestamp("harvest_or_needed_date", { withTimezone: true }).notNull(),
    /** TENDER_PERMINTAAN only. */
    biddingDeadline: timestamp("bidding_deadline", { withTimezone: true }),

    isOpen: boolean("is_open").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("market_posts_creator_id_idx").on(t.creatorId),
    index("market_posts_browse_idx").on(t.type, t.isOpen, t.category),
    index("market_posts_created_at_idx").on(t.createdAt),
    // Guards concurrent quota decrements: an over-allocation fails at the DB.
    check(
      "market_posts_quota_bounds",
      sql`${t.remainingQuotaKg} >= 0 and ${t.remainingQuotaKg} <= ${t.totalQuotaKg}`,
    ),
    check("market_posts_min_order", sql`${t.minOrderKg} > 0 and ${t.minOrderKg} <= ${t.totalQuotaKg}`),
    check("market_posts_price_positive", sql`${t.pricePerKgIdr} > 0`),
    check(
      "market_posts_tender_deadline",
      sql`${t.type} <> 'TENDER_PERMINTAAN' or ${t.biddingDeadline} is not null`,
    ),
  ],
).enableRLS();

/*
 * Covers both offer kinds:
 * - PRE_ORDER: BUYER on ETALASE_PANEN, offeredPricePerKgIdr = post price.
 * - TENDER_BID: FARMER on TENDER_PERMINTAAN, own price.
 * deliveryFeeIdr is computed server-side from the farmer's config.
 */
export const bids = pgTable(
  "bids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => marketPosts.id, { onDelete: "cascade" }),
    bidderId: text("bidder_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    weightKg: integer("weight_kg").notNull(),
    offeredPricePerKgIdr: integer("offered_price_per_kg_idr").notNull(),
    deliveryMethod: deliveryMethodEnum("delivery_method").notNull().default("SELF_PICKUP"),
    deliveryFeeIdr: integer("delivery_fee_idr").notNull().default(0),
    /** FARMER_DELIVERY drop-off, snapshotted at submit time. */
    deliveryAddress: text("delivery_address"),
    deliveryLatitude: doublePrecision("delivery_latitude"),
    deliveryLongitude: doublePrecision("delivery_longitude"),
    distanceKm: doublePrecision("distance_km"),
    notes: text("notes"),
    status: bidStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bids_post_id_status_idx").on(t.postId, t.status),
    index("bids_bidder_id_idx").on(t.bidderId),
    // One live offer per bidder per post.
    uniqueIndex("bids_one_pending_per_bidder")
      .on(t.postId, t.bidderId)
      .where(sql`${t.status} = 'PENDING'`),
    check("bids_weight_positive", sql`${t.weightKg} > 0`),
    check("bids_price_positive", sql`${t.offeredPricePerKgIdr} > 0`),
    check(
      "bids_self_pickup_free",
      sql`${t.deliveryMethod} <> 'SELF_PICKUP' or ${t.deliveryFeeIdr} = 0`,
    ),
    check("bids_delivery_fee_non_negative", sql`${t.deliveryFeeIdr} >= 0`),
  ],
).enableRLS();
