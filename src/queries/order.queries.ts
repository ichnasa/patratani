import "server-only";
import { and, asc, count, desc, eq, exists, gte, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import type {
  DeliveryMethod,
  MarketPostType,
  OrderDetailDTO,
  OrderStatus,
} from "@/contracts/patra-tani.contract";
import { db } from "@/db";
import {
  disputes,
  farmerDeliveryConfigs,
  handoverEvidences,
  bids,
  marketPosts,
  orders,
  reviews,
  users,
} from "@/db/schema";
import { AppError } from "@/lib/action-handler";
import { requireAuth } from "@/lib/auth-guard";
import { createHandoverEvidenceSignedUrl } from "@/lib/supabase-storage";

/*
 * Read queries for Server Components. Uncached (live escrow state, per-viewer
 * data); with `cacheComponents` enabled, render callers inside <Suspense>.
 * Guards throw AppError (UNAUTHENTICATED / FORBIDDEN); protect routes upstream.
 */

/** Counterparty phone numbers are revealed only once money is in escrow. */
const PHONE_VISIBLE_STATUSES: readonly OrderStatus[] = [
  "PAID_HELD",
  "HANDOVER",
  "COMPLETED",
  "DISPUTED",
  "REFUNDED",
];

/** Start of the current calendar month in Asia/Jakarta, as timestamptz. */
const jakartaMonthStart = sql`(date_trunc('month', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta')`;

const toNumber = (sqlExpr: SQL) => sqlExpr.mapWith(Number);
const percent = (part: number, whole: number) =>
  whole === 0 ? null : Math.round((part / whole) * 1000) / 10;

/* ------------------------------- Order detail ------------------------------ */

/**
 * Full order view for either party or an ADMIN (dispute review).
 * Returns null when the order does not exist; FORBIDDEN for outsiders.
 */
export async function getOrderDetailQuery(orderId: string): Promise<OrderDetailDTO | null> {
  const viewer = await requireAuth();
  if (!z.string().uuid().safeParse(orderId).success) return null;

  const partyColumns = {
    id: true,
    name: true,
    businessName: true,
    phone: true,
    image: true,
    ratingAvg: true,
    ratingCount: true,
  } as const;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      post: true,
      bid: true,
      farmer: { columns: { ...partyColumns, address: true, latitude: true, longitude: true } },
      buyer: { columns: partyColumns },
      handoverEvidences: { orderBy: (t, { asc: ascending }) => [ascending(t.capturedAt)] },
      dispute: true,
      reviews: true,
    },
  });
  if (!order) return null;

  const isAdmin = viewer.role === "ADMIN";
  if (!isAdmin && viewer.id !== order.farmerId && viewer.id !== order.buyerId) {
    throw new AppError("FORBIDDEN", "Anda tidak memiliki akses ke pesanan ini.");
  }

  const showPhones = isAdmin || PHONE_VISIBLE_STATUSES.includes(order.status);
  const toParty = (p: typeof order.buyer, isSelf: boolean) => ({
    id: p.id,
    name: p.name,
    businessName: p.businessName,
    phone: isSelf || showPhones ? p.phone : null,
    image: p.image,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
  });

  // ETALASE: goods leave the harvest location. TENDER: they leave the farmer's profile location.
  const isEtalase = order.post.type === "ETALASE_PANEN";
  const farmerHasPoint = order.farmer.latitude !== null && order.farmer.longitude !== null;
  const pickupAddress = isEtalase ? order.post.address : order.farmer.address;
  const pickupPoint = isEtalase
    ? { latitude: order.post.latitude, longitude: order.post.longitude }
    : farmerHasPoint
      ? { latitude: order.farmer.latitude!, longitude: order.farmer.longitude! }
      : null;

  const hasDropOff = order.bid.deliveryLatitude !== null && order.bid.deliveryLongitude !== null;

  const handoverEvidenceDtos = await Promise.all(
    order.handoverEvidences.map(async (e) => ({
      id: e.id,
      uploadedByRole: e.uploadedByRole,
      photoUrl: await createHandoverEvidenceSignedUrl(e.storagePath),
      capturedLatitude: e.capturedLatitude,
      capturedLongitude: e.capturedLongitude,
      capturedAt: e.capturedAt,
    })),
  );

  const myReview = order.reviews.find((r) => r.reviewerId === viewer.id);

  return {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    postId: order.postId,
    postType: order.post.type,
    commodityName: order.post.commodityName,
    category: order.post.category,
    scheduledHandoverDate: order.post.harvestOrNeededDate,
    farmer: toParty(order.farmer, viewer.id === order.farmerId),
    buyer: toParty(order.buyer, viewer.id === order.buyerId),
    fixedWeightKg: order.fixedWeightKg,
    agreedPricePerKgIdr: order.agreedPricePerKgIdr,
    subtotalHarvestIdr: order.subtotalHarvestIdr,
    deliveryMethod: order.deliveryMethod,
    deliveryFeeIdr: order.deliveryFeeIdr,
    totalEscrowHeldIdr: order.totalEscrowHeldIdr,
    platformCommissionIdr: order.platformCommissionIdr,
    netFarmerPayoutIdr: order.netFarmerPayoutIdr,
    pickupAddress,
    pickupPoint,
    deliveryAddress: order.bid.deliveryAddress,
    deliveryPoint: hasDropOff
      ? { latitude: order.bid.deliveryLatitude!, longitude: order.bid.deliveryLongitude! }
      : null,
    distanceKm: order.bid.distanceKm,
    isH1Confirmed: order.isH1Confirmed,
    h1Notes: order.h1Notes,
    h1ConfirmedAt: order.h1ConfirmedAt,
    handoverEvidences: handoverEvidenceDtos,
    farmerConfirmedComplete: order.farmerConfirmedComplete,
    buyerConfirmedComplete: order.buyerConfirmedComplete,
    dispute: order.dispute && {
      reason: order.dispute.reason,
      openedByUserId: order.dispute.openedByUserId,
      createdAt: order.dispute.createdAt,
      resolution: order.dispute.resolution,
      adminNotes: order.dispute.adminNotes,
      resolvedAt: order.dispute.resolvedAt,
    },
    myReview: myReview
      ? { rating: myReview.rating, comment: myReview.comment, createdAt: myReview.createdAt }
      : null,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    completedAt: order.completedAt,
    canceledAt: order.canceledAt,
  };
}

/* --------------------------------- My orders ------------------------------- */

/** What the viewer should do next on an order; null = waiting on the other side. */
export type OrderNextAction =
  | "PAY_ESCROW"
  | "CONFIRM_H1"
  | "UPLOAD_HANDOVER"
  | "CONFIRM_COMPLETE"
  | "SUBMIT_REVIEW";

export type MyOrderListItem = {
  id: string;
  orderCode: string;
  status: OrderStatus;
  mySide: "FARMER" | "BUYER";
  postType: MarketPostType;
  commodityName: string;
  fixedWeightKg: number;
  agreedPricePerKgIdr: number;
  deliveryMethod: DeliveryMethod;
  totalEscrowHeldIdr: number;
  netFarmerPayoutIdr: number;
  scheduledHandoverDate: Date;
  createdAt: Date;
  counterparty: { id: string; name: string; businessName: string | null; image: string | null };
  nextAction: OrderNextAction | null;
};

/** Orders where the signed-in user is farmer or buyer, newest first. */
export async function getMyOrdersQuery(options: { status?: OrderStatus[] } = {}): Promise<MyOrderListItem[]> {
  const viewer = await requireAuth(["FARMER", "BUYER"]);

  const counterpartyId = sql`case when ${orders.farmerId} = ${viewer.id} then ${orders.buyerId} else ${orders.farmerId} end`;
  const conditions: SQL[] = [or(eq(orders.farmerId, viewer.id), eq(orders.buyerId, viewer.id))!];
  if (options.status?.length) conditions.push(inArray(orders.status, options.status));

  const rows = await db
    .select({
      order: orders,
      postType: marketPosts.type,
      commodityName: marketPosts.commodityName,
      scheduledHandoverDate: marketPosts.harvestOrNeededDate,
      counterparty: {
        id: users.id,
        name: users.name,
        businessName: users.businessName,
        image: users.image,
      },
      myReviewId: reviews.id,
    })
    .from(orders)
    .innerJoin(marketPosts, eq(marketPosts.id, orders.postId))
    .innerJoin(users, sql`${users.id} = ${counterpartyId}`)
    .leftJoin(reviews, and(eq(reviews.orderId, orders.id), eq(reviews.reviewerId, viewer.id)))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt));

  return rows.map(({ order, myReviewId, ...rest }) => {
    const mySide = order.farmerId === viewer.id ? "FARMER" : "BUYER";
    const myConfirmed = mySide === "FARMER" ? order.farmerConfirmedComplete : order.buyerConfirmedComplete;
    let nextAction: OrderNextAction | null = null;
    if (order.status === "AWARDED" && mySide === "BUYER") nextAction = "PAY_ESCROW";
    else if (order.status === "PAID_HELD" && order.isH1Confirmed === null && mySide === "FARMER") nextAction = "CONFIRM_H1";
    else if (order.status === "PAID_HELD" && order.isH1Confirmed === true) nextAction = "UPLOAD_HANDOVER";
    else if (order.status === "HANDOVER" && !myConfirmed) nextAction = "CONFIRM_COMPLETE";
    else if (order.status === "COMPLETED" && !myReviewId) nextAction = "SUBMIT_REVIEW";

    return {
      id: order.id,
      orderCode: order.orderCode,
      status: order.status,
      mySide,
      postType: rest.postType,
      commodityName: rest.commodityName,
      fixedWeightKg: order.fixedWeightKg,
      agreedPricePerKgIdr: order.agreedPricePerKgIdr,
      deliveryMethod: order.deliveryMethod,
      totalEscrowHeldIdr: order.totalEscrowHeldIdr,
      netFarmerPayoutIdr: order.netFarmerPayoutIdr,
      scheduledHandoverDate: rest.scheduledHandoverDate,
      createdAt: order.createdAt,
      counterparty: rest.counterparty,
      nextAction,
    };
  });
}

/* ----------------------------- Farmer dashboard ---------------------------- */

export type FarmerDashboardSummary = {
  walletBalanceIdr: number;
  ratingAvg: number;
  ratingCount: number;
  isDeliveryEnabled: boolean;
  activeEtalaseCount: number;
  /** PENDING pre-orders on the farmer's posts plus the farmer's own PENDING tender bids. */
  pendingBidCount: number;
  orderCounts: { awarded: number; paidHeld: number; handover: number; disputed: number };
  /** Net payout still in escrow (PAID_HELD, HANDOVER, DISPUTED). */
  pendingPayoutIdr: number;
  thisMonth: { completedOrders: number; earningsIdr: number; soldKg: number };
  /** PAID_HELD orders still awaiting the farmer's H-1 answer, soonest first. */
  h1ConfirmationsDue: {
    orderId: string;
    orderCode: string;
    commodityName: string;
    fixedWeightKg: number;
    scheduledHandoverDate: Date;
  }[];
};

export async function getFarmerDashboardSummaryQuery(): Promise<FarmerDashboardSummary> {
  const viewer = await requireAuth(["FARMER"]);
  const mine = eq(orders.farmerId, viewer.id);
  const completedThisMonth = sql`${orders.status} = 'COMPLETED' and ${orders.completedAt} >= ${jakartaMonthStart}`;

  const [profile, config, [posts], [pending], [stats], due] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, viewer.id),
      columns: { walletBalanceIdr: true, ratingAvg: true, ratingCount: true },
    }),
    db.query.farmerDeliveryConfigs.findFirst({
      where: eq(farmerDeliveryConfigs.userId, viewer.id),
      columns: { isDeliveryEnabled: true },
    }),
    db
      .select({ activeEtalaseCount: count() })
      .from(marketPosts)
      .where(
        and(
          eq(marketPosts.creatorId, viewer.id),
          eq(marketPosts.type, "ETALASE_PANEN"),
          eq(marketPosts.isOpen, true),
        ),
      ),
    db
      .select({ pendingBidCount: count() })
      .from(bids)
      .innerJoin(marketPosts, eq(marketPosts.id, bids.postId))
      .where(
        and(
          eq(bids.status, "PENDING"),
          or(eq(marketPosts.creatorId, viewer.id), eq(bids.bidderId, viewer.id)),
        ),
      ),
    db
      .select({
        awarded: toNumber(sql`count(*) filter (where ${orders.status} = 'AWARDED')`),
        paidHeld: toNumber(sql`count(*) filter (where ${orders.status} = 'PAID_HELD')`),
        handover: toNumber(sql`count(*) filter (where ${orders.status} = 'HANDOVER')`),
        disputed: toNumber(sql`count(*) filter (where ${orders.status} = 'DISPUTED')`),
        pendingPayoutIdr: toNumber(
          sql`coalesce(sum(${orders.netFarmerPayoutIdr}) filter (where ${orders.status} in ('PAID_HELD', 'HANDOVER', 'DISPUTED')), 0)`,
        ),
        completedOrders: toNumber(sql`count(*) filter (where ${completedThisMonth})`),
        earningsIdr: toNumber(sql`coalesce(sum(${orders.netFarmerPayoutIdr}) filter (where ${completedThisMonth}), 0)`),
        soldKg: toNumber(sql`coalesce(sum(${orders.fixedWeightKg}) filter (where ${completedThisMonth}), 0)`),
      })
      .from(orders)
      .where(mine),
    db
      .select({
        orderId: orders.id,
        orderCode: orders.orderCode,
        commodityName: marketPosts.commodityName,
        fixedWeightKg: orders.fixedWeightKg,
        scheduledHandoverDate: marketPosts.harvestOrNeededDate,
      })
      .from(orders)
      .innerJoin(marketPosts, eq(marketPosts.id, orders.postId))
      .where(and(mine, eq(orders.status, "PAID_HELD"), isNull(orders.isH1Confirmed)))
      .orderBy(asc(marketPosts.harvestOrNeededDate))
      .limit(10),
  ]);

  return {
    walletBalanceIdr: profile?.walletBalanceIdr ?? 0,
    ratingAvg: profile?.ratingAvg ?? 0,
    ratingCount: profile?.ratingCount ?? 0,
    isDeliveryEnabled: config?.isDeliveryEnabled ?? false,
    activeEtalaseCount: posts.activeEtalaseCount,
    pendingBidCount: pending.pendingBidCount,
    orderCounts: {
      awarded: stats.awarded,
      paidHeld: stats.paidHeld,
      handover: stats.handover,
      disputed: stats.disputed,
    },
    pendingPayoutIdr: stats.pendingPayoutIdr,
    thisMonth: {
      completedOrders: stats.completedOrders,
      earningsIdr: stats.earningsIdr,
      soldKg: stats.soldKg,
    },
    h1ConfirmationsDue: due,
  };
}

/* ------------------------------ Admin metrics ------------------------------ */

const ACTIVE_WINDOW_DAYS = 30;

/** Lean Canvas key metrics. */
export type AdminKeyMetrics = {
  /** FARMERs who posted or had an order in the last 30 days. */
  activeFarmersCount: number;
  /** BUYERs (HoReCa/UMKM) who posted a tender or had an order in the last 30 days. */
  activeBuyersCount: number;
  /** Current calendar month, Asia/Jakarta. */
  monthlyCompletedTransactions: number;
  monthlyGmvIdr: number;
  monthlyCommissionIdr: number;
  /**
   * All-time % of settled orders (COMPLETED + REFUNDED) that completed with no
   * dispute. null until any order settles. H-1 cancellations are excluded.
   */
  disputeFreeCompletionRatePct: number | null;
  /** All-time average review rating (1–5); null when there are no reviews. */
  averageTransactionRating: number | null;
  reviewCount: number;
  openDisputesCount: number;
};

export async function getAdminKeyMetricsQuery(): Promise<AdminKeyMetrics> {
  await requireAuth(["ADMIN"]);
  const since = sql`now() - make_interval(days => ${ACTIVE_WINDOW_DAYS})`;

  const activeUsers = (role: "FARMER" | "BUYER") =>
    db
      .select({ n: count() })
      .from(users)
      .where(
        and(
          eq(users.role, role),
          or(
            exists(
              db
                .select({ one: sql`1` })
                .from(marketPosts)
                .where(and(eq(marketPosts.creatorId, users.id), gte(marketPosts.createdAt, since))),
            ),
            exists(
              db
                .select({ one: sql`1` })
                .from(orders)
                .where(
                  and(
                    eq(role === "FARMER" ? orders.farmerId : orders.buyerId, users.id),
                    gte(orders.createdAt, since),
                  ),
                ),
            ),
          ),
        ),
      );

  const [[farmers], [buyers], [monthly], [settled], [rating], [open]] = await Promise.all([
    activeUsers("FARMER"),
    activeUsers("BUYER"),
    db
      .select({
        completed: count(),
        gmvIdr: toNumber(sql`coalesce(sum(${orders.totalEscrowHeldIdr}), 0)`),
        commissionIdr: toNumber(sql`coalesce(sum(${orders.platformCommissionIdr}), 0)`),
      })
      .from(orders)
      .where(and(eq(orders.status, "COMPLETED"), gte(orders.completedAt, jakartaMonthStart))),
    db
      .select({
        clean: toNumber(sql`count(*) filter (where ${orders.status} = 'COMPLETED' and ${disputes.id} is null)`),
        settled: toNumber(sql`count(*) filter (where ${orders.status} in ('COMPLETED', 'REFUNDED'))`),
      })
      .from(orders)
      .leftJoin(disputes, eq(disputes.orderId, orders.id)),
    db
      .select({
        avg: sql<number | null>`avg(${reviews.rating})`.mapWith((v) => (v === null ? null : Number(v))),
        n: count(),
      })
      .from(reviews),
    db.select({ n: count() }).from(disputes).where(isNull(disputes.resolution)),
  ]);

  return {
    activeFarmersCount: farmers.n,
    activeBuyersCount: buyers.n,
    monthlyCompletedTransactions: monthly.completed,
    monthlyGmvIdr: monthly.gmvIdr,
    monthlyCommissionIdr: monthly.commissionIdr,
    disputeFreeCompletionRatePct: percent(settled.clean, settled.settled),
    averageTransactionRating: rating.avg === null ? null : Math.round(rating.avg * 100) / 100,
    reviewCount: rating.n,
    openDisputesCount: open.n,
  };
}

/* ------------------------------- Admin queue ------------------------------- */

export type OpenDisputeListItem = {
  disputeId: string;
  orderId: string;
  orderCode: string;
  reason: string;
  openedBySide: "FARMER" | "BUYER";
  createdAt: Date;
  totalEscrowHeldIdr: number;
  photoCount: number;
};

/** Unresolved disputes, oldest first, for the admin review queue. */
export async function getOpenDisputesQuery(): Promise<OpenDisputeListItem[]> {
  await requireAuth(["ADMIN"]);

  const rows = await db
    .select({
      disputeId: disputes.id,
      orderId: orders.id,
      orderCode: orders.orderCode,
      reason: disputes.reason,
      openedByUserId: disputes.openedByUserId,
      farmerId: orders.farmerId,
      createdAt: disputes.createdAt,
      totalEscrowHeldIdr: orders.totalEscrowHeldIdr,
      photoCount: toNumber(
        sql`(select count(*) from ${handoverEvidences} where ${handoverEvidences.orderId} = ${orders.id})`,
      ),
    })
    .from(disputes)
    .innerJoin(orders, eq(orders.id, disputes.orderId))
    .where(isNull(disputes.resolution))
    .orderBy(asc(disputes.createdAt));

  return rows.map(({ openedByUserId, farmerId, ...rest }) => ({
    ...rest,
    openedBySide: openedByUserId === farmerId ? "FARMER" : "BUYER",
  }));
}
