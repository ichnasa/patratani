import { relations } from "drizzle-orm";
import { accounts, farmerDeliveryConfigs, sessions, users } from "./auth";
import { bids, marketPosts } from "./market";
import {
  disputes,
  handoverEvidences,
  orders,
  reviews,
  walletTransactions,
} from "./orders";

export * from "./enums";
export * from "./auth";
export * from "./market";
export * from "./orders";

/* -------------------------------- Relations ------------------------------- */
// relationName disambiguates tables with several FKs to `users`.

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  deliveryConfig: one(farmerDeliveryConfigs),
  marketPosts: many(marketPosts),
  bids: many(bids),
  farmerOrders: many(orders, { relationName: "order_farmer" }),
  buyerOrders: many(orders, { relationName: "order_buyer" }),
  reviewsGiven: many(reviews, { relationName: "review_reviewer" }),
  reviewsReceived: many(reviews, { relationName: "review_reviewee" }),
  walletTransactions: many(walletTransactions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const farmerDeliveryConfigsRelations = relations(farmerDeliveryConfigs, ({ one }) => ({
  user: one(users, { fields: [farmerDeliveryConfigs.userId], references: [users.id] }),
}));

export const marketPostsRelations = relations(marketPosts, ({ one, many }) => ({
  creator: one(users, { fields: [marketPosts.creatorId], references: [users.id] }),
  bids: many(bids),
  orders: many(orders),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  post: one(marketPosts, { fields: [bids.postId], references: [marketPosts.id] }),
  bidder: one(users, { fields: [bids.bidderId], references: [users.id] }),
  order: one(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  post: one(marketPosts, { fields: [orders.postId], references: [marketPosts.id] }),
  bid: one(bids, { fields: [orders.bidId], references: [bids.id] }),
  farmer: one(users, {
    fields: [orders.farmerId],
    references: [users.id],
    relationName: "order_farmer",
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "order_buyer",
  }),
  handoverEvidences: many(handoverEvidences),
  dispute: one(disputes),
  reviews: many(reviews),
  walletTransactions: many(walletTransactions),
}));

export const handoverEvidencesRelations = relations(handoverEvidences, ({ one }) => ({
  order: one(orders, { fields: [handoverEvidences.orderId], references: [orders.id] }),
  uploadedBy: one(users, { fields: [handoverEvidences.uploadedByUserId], references: [users.id] }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  order: one(orders, { fields: [disputes.orderId], references: [orders.id] }),
  openedBy: one(users, { fields: [disputes.openedByUserId], references: [users.id] }),
  resolvedBy: one(users, { fields: [disputes.resolvedByAdminId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "review_reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "review_reviewee",
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, { fields: [walletTransactions.userId], references: [users.id] }),
  order: one(orders, { fields: [walletTransactions.orderId], references: [orders.id] }),
}));
