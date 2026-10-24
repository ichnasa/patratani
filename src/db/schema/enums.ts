import { pgEnum } from "drizzle-orm/pg-core";
// Relative import: drizzle-kit does not reliably resolve tsconfig path aliases.
import {
  BID_STATUSES,
  COMMODITY_CATEGORIES,
  DELIVERY_METHODS,
  DISPUTE_RESOLUTIONS,
  MARKET_POST_TYPES,
  ORDER_STATUSES,
  USER_ROLES,
  WALLET_TRANSACTION_TYPES,
} from "../../contracts/patra-tani.contract";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const marketPostTypeEnum = pgEnum("market_post_type", MARKET_POST_TYPES);
export const commodityCategoryEnum = pgEnum("commodity_category", COMMODITY_CATEGORIES);
export const deliveryMethodEnum = pgEnum("delivery_method", DELIVERY_METHODS);
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);
export const bidStatusEnum = pgEnum("bid_status", BID_STATUSES);
export const disputeResolutionEnum = pgEnum("dispute_resolution", DISPUTE_RESOLUTIONS);
export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", WALLET_TRANSACTION_TYPES);
