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
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

/*
 * Better Auth core tables. Plural table names require
 * `drizzleAdapter(db, { provider: "pg", usePlural: true })`.
 * IDs are `text` because Better Auth generates string IDs.
 */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    // Patra Tani fields (declared as Better Auth `additionalFields`).
    role: userRoleEnum("role").notNull().default("BUYER"),
    businessName: text("business_name"),
    phone: text("phone"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    walletBalanceIdr: integer("wallet_balance_idr").notNull().default(0),
    ratingAvg: doublePrecision("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
  },
  (t) => [
    index("users_role_idx").on(t.role),
    check("users_wallet_balance_non_negative", sql`${t.walletBalanceIdr} >= 0`),
    check("users_rating_avg_range", sql`${t.ratingAvg} between 0 and 5`),
  ],
).enableRLS();

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
).enableRLS();

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
).enableRLS();

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
).enableRLS();

/** 1-to-1 with a FARMER user. Capacity/fee columns are required only when enabled. */
export const farmerDeliveryConfigs = pgTable(
  "farmer_delivery_configs",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    isDeliveryEnabled: boolean("is_delivery_enabled").notNull().default(false),
    minCapacityKg: integer("min_capacity_kg"),
    maxCapacityKg: integer("max_capacity_kg"),
    maxRadiusKm: integer("max_radius_km"),
    fixedDeliveryFeeIdr: integer("fixed_delivery_fee_idr"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Explicit null checks: a CHECK that evaluates to NULL passes in Postgres.
    check(
      "farmer_delivery_configs_enabled_complete",
      sql`not ${t.isDeliveryEnabled} or (
        ${t.minCapacityKg} is not null
        and ${t.maxCapacityKg} is not null
        and ${t.maxRadiusKm} is not null
        and ${t.fixedDeliveryFeeIdr} is not null
        and ${t.minCapacityKg} > 0
        and ${t.maxCapacityKg} >= ${t.minCapacityKg}
        and ${t.maxRadiusKm} > 0
        and ${t.fixedDeliveryFeeIdr} >= 0
      )`,
    ),
  ],
).enableRLS();
