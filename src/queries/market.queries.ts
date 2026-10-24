import "server-only";
import { and, asc, count, desc, eq, gt, gte, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import {
  MarketFilterParamsSchema,
  type BidStatus,
  type CommodityCategory,
  type DeliveryMethod,
  type MarketPostType,
} from "@/contracts/patra-tani.contract";
import { db } from "@/db";
import { bids, farmerDeliveryConfigs, marketPosts, users } from "@/db/schema";
import { getCurrentSessionUser } from "@/lib/auth-guard";
import { calculateHaversineDistanceKm, toFarmerDeliveryConfig } from "@/lib/geo";

/*
 * Read queries for Server Components. Intentionally uncached: quota and bids
 * must be live, and the detail view depends on the viewer. With
 * `cacheComponents` enabled, render callers inside <Suspense>.
 */

/* ---------------------------------- Types --------------------------------- */

export type MarketPostCreator = {
  id: string;
  name: string;
  businessName: string | null;
  image: string | null;
  ratingAvg: number;
  ratingCount: number;
};

/** Present only on ETALASE_PANEN posts whose farmer enabled FARMER_DELIVERY. */
export type FarmerDeliveryBadge = {
  minCapacityKg: number;
  maxCapacityKg: number;
  maxRadiusKm: number;
  fixedDeliveryFeeIdr: number;
  /** null when the viewer's location is unknown. */
  deliversToViewer: boolean | null;
};

export type MarketPostListItem = {
  id: string;
  type: MarketPostType;
  title: string;
  commodityName: string;
  category: CommodityCategory;
  coverImageUrl: string | null;
  address: string;
  totalQuotaKg: number;
  remainingQuotaKg: number;
  minOrderKg: number;
  /** ETALASE_PANEN: fixed price. TENDER_PERMINTAAN: max budget. */
  pricePerKgIdr: number;
  harvestOrNeededDate: Date;
  biddingDeadline: Date | null;
  createdAt: Date;
  /** Distance from the filter location; null when none was given. */
  distanceKm: number | null;
  creator: MarketPostCreator;
  farmerDelivery: FarmerDeliveryBadge | null;
};

export type MarketPostsPage = {
  items: MarketPostListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type MarketBidView = {
  id: string;
  weightKg: number;
  offeredPricePerKgIdr: number;
  deliveryMethod: DeliveryMethod;
  deliveryFeeIdr: number;
  distanceKm: number | null;
  notes: string | null;
  status: BidStatus;
  createdAt: Date;
  bidder: MarketPostCreator;
};

export type MarketPostDetail = Omit<MarketPostListItem, "coverImageUrl" | "farmerDelivery"> & {
  description: string | null;
  imageUrls: string[];
  latitude: number;
  longitude: number;
  isOpen: boolean;
  /** Full delivery rules of the farmer (ETALASE_PANEN only). */
  farmerDelivery: Omit<FarmerDeliveryBadge, "deliversToViewer"> | null;
  isOwner: boolean;
  /**
   * Owner: every PENDING bid. Other signed-in users: only their own bids
   * (any status). Anonymous: empty. Competitor prices stay private.
   */
  bids: MarketBidView[];
  pendingBidCount: number;
};

/* --------------------------------- Helpers -------------------------------- */

/** Haversine in SQL so radius filtering, sorting and pagination happen in the DB. */
function distanceKmSql(latitude: number, longitude: number): SQL<number> {
  const lat = sql`${latitude}::double precision`;
  const lng = sql`${longitude}::double precision`;
  return sql<number>`(6371 * 2 * asin(least(1, sqrt(
    power(sin(radians(${marketPosts.latitude} - ${lat}) / 2), 2)
    + cos(radians(${lat})) * cos(radians(${marketPosts.latitude}))
    * power(sin(radians(${marketPosts.longitude} - ${lng}) / 2), 2)
  ))))`;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

const creatorColumns = {
  id: users.id,
  name: users.name,
  businessName: users.businessName,
  image: users.image,
  ratingAvg: users.ratingAvg,
  ratingCount: users.ratingCount,
};

/** Posts still accepting offers: open, quota left, tender deadline not passed. */
function acceptingOffersCondition(): SQL {
  return and(
    eq(marketPosts.isOpen, true),
    gt(marketPosts.remainingQuotaKg, 0),
    or(
      ne(marketPosts.type, "TENDER_PERMINTAAN"),
      gt(marketPosts.biddingDeadline, sql`now()`),
    ),
  )!;
}

/* --------------------------------- Queries -------------------------------- */

/**
 * UC-03: browse the market. Accepts raw URL searchParams or parsed filters;
 * invalid params fall back to defaults instead of breaking the page.
 */
export async function getMarketPostsQuery(
  filters: z.input<typeof MarketFilterParamsSchema> | Record<string, unknown> = {},
): Promise<MarketPostsPage> {
  const parsed = MarketFilterParamsSchema.safeParse(filters);
  const f = parsed.success ? parsed.data : MarketFilterParamsSchema.parse({});

  const hasPoint = f.latitude !== undefined && f.longitude !== undefined;
  const distance = hasPoint ? distanceKmSql(f.latitude!, f.longitude!) : null;
  const deliveryEnabled = and(
    eq(marketPosts.type, "ETALASE_PANEN"),
    eq(farmerDeliveryConfigs.isDeliveryEnabled, true),
  );

  const conditions: SQL[] = [acceptingOffersCondition()];
  if (f.postType) conditions.push(eq(marketPosts.type, f.postType));
  if (f.category) conditions.push(eq(marketPosts.category, f.category));
  if (f.q) {
    const pattern = `%${escapeLike(f.q)}%`;
    conditions.push(
      or(ilike(marketPosts.title, pattern), ilike(marketPosts.commodityName, pattern))!,
    );
  }
  if (f.minPricePerKgIdr !== undefined) {
    conditions.push(gte(marketPosts.pricePerKgIdr, f.minPricePerKgIdr));
  }
  if (f.maxPricePerKgIdr !== undefined) {
    conditions.push(lte(marketPosts.pricePerKgIdr, f.maxPricePerKgIdr));
  }
  if (distance && f.radiusKm !== undefined) {
    conditions.push(sql`${distance} <= ${f.radiusKm}`);
  }
  if (f.deliveryMethod === "FARMER_DELIVERY") {
    // Only farmers who deliver, and (if location known) whose radius covers the viewer.
    conditions.push(deliveryEnabled!);
    if (distance) conditions.push(sql`${distance} <= ${farmerDeliveryConfigs.maxRadiusKm}`);
  }
  const where = and(...conditions);

  const orderBy: SQL[] = (() => {
    switch (f.sortBy) {
      case "PRICE_ASC":
        return [asc(marketPosts.pricePerKgIdr), desc(marketPosts.createdAt)];
      case "PRICE_DESC":
        return [desc(marketPosts.pricePerKgIdr), desc(marketPosts.createdAt)];
      case "HARVEST_DATE":
        return [asc(marketPosts.harvestOrNeededDate), desc(marketPosts.createdAt)];
      case "DISTANCE":
        return distance ? [asc(distance), desc(marketPosts.createdAt)] : [desc(marketPosts.createdAt)];
      default:
        return [desc(marketPosts.createdAt)];
    }
  })();

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        post: {
          id: marketPosts.id,
          type: marketPosts.type,
          title: marketPosts.title,
          commodityName: marketPosts.commodityName,
          category: marketPosts.category,
          imageUrls: marketPosts.imageUrls,
          address: marketPosts.address,
          totalQuotaKg: marketPosts.totalQuotaKg,
          remainingQuotaKg: marketPosts.remainingQuotaKg,
          minOrderKg: marketPosts.minOrderKg,
          pricePerKgIdr: marketPosts.pricePerKgIdr,
          harvestOrNeededDate: marketPosts.harvestOrNeededDate,
          biddingDeadline: marketPosts.biddingDeadline,
          createdAt: marketPosts.createdAt,
        },
        creator: creatorColumns,
        delivery: {
          isDeliveryEnabled: farmerDeliveryConfigs.isDeliveryEnabled,
          minCapacityKg: farmerDeliveryConfigs.minCapacityKg,
          maxCapacityKg: farmerDeliveryConfigs.maxCapacityKg,
          maxRadiusKm: farmerDeliveryConfigs.maxRadiusKm,
          fixedDeliveryFeeIdr: farmerDeliveryConfigs.fixedDeliveryFeeIdr,
        },
        distanceKm: distance ?? sql<null>`null`,
      })
      .from(marketPosts)
      .innerJoin(users, eq(users.id, marketPosts.creatorId))
      .leftJoin(farmerDeliveryConfigs, eq(farmerDeliveryConfigs.userId, marketPosts.creatorId))
      .where(where)
      .orderBy(...orderBy)
      .limit(f.pageSize)
      .offset((f.page - 1) * f.pageSize),
    db
      .select({ total: count() })
      .from(marketPosts)
      .leftJoin(farmerDeliveryConfigs, eq(farmerDeliveryConfigs.userId, marketPosts.creatorId))
      .where(where),
  ]);

  const items = rows.map(({ post, creator, delivery, distanceKm }): MarketPostListItem => {
    const { imageUrls, ...rest } = post;
    const config = post.type === "ETALASE_PANEN" ? toFarmerDeliveryConfig(delivery) : null;
    const km = distanceKm === null ? null : Number(distanceKm);
    return {
      ...rest,
      coverImageUrl: imageUrls[0] ?? null,
      distanceKm: km,
      creator,
      farmerDelivery: config && {
        minCapacityKg: config.minCapacityKg,
        maxCapacityKg: config.maxCapacityKg,
        maxRadiusKm: config.maxRadiusKm,
        fixedDeliveryFeeIdr: config.fixedDeliveryFeeIdr,
        deliversToViewer: km === null ? null : km <= config.maxRadiusKm,
      },
    };
  });

  return {
    items,
    page: f.page,
    pageSize: f.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / f.pageSize)),
  };
}

/**
 * UC-04: post detail with the farmer's delivery rules and the bids the
 * viewer may see. Returns null when the post does not exist.
 */
export async function getMarketPostDetailQuery(postId: string): Promise<MarketPostDetail | null> {
  if (!z.string().uuid().safeParse(postId).success) return null;

  const [viewer, row] = await Promise.all([
    getCurrentSessionUser(),
    db
      .select({ post: marketPosts, creator: creatorColumns })
      .from(marketPosts)
      .innerJoin(users, eq(users.id, marketPosts.creatorId))
      .where(eq(marketPosts.id, postId))
      .then((r) => r[0]),
  ]);
  if (!row) return null;
  const { post, creator } = row;
  const isOwner = viewer?.id === post.creatorId;

  const bidVisibility = isOwner
    ? eq(bids.status, "PENDING")
    : viewer
      ? eq(bids.bidderId, viewer.id)
      : sql`false`;

  const [deliveryRow, visibleBids, [{ pendingBidCount }]] = await Promise.all([
    post.type === "ETALASE_PANEN"
      ? db.query.farmerDeliveryConfigs.findFirst({
          where: eq(farmerDeliveryConfigs.userId, post.creatorId),
        })
      : Promise.resolve(undefined),
    db
      .select({
        bid: {
          id: bids.id,
          weightKg: bids.weightKg,
          offeredPricePerKgIdr: bids.offeredPricePerKgIdr,
          deliveryMethod: bids.deliveryMethod,
          deliveryFeeIdr: bids.deliveryFeeIdr,
          distanceKm: bids.distanceKm,
          notes: bids.notes,
          status: bids.status,
          createdAt: bids.createdAt,
        },
        bidder: creatorColumns,
      })
      .from(bids)
      .innerJoin(users, eq(users.id, bids.bidderId))
      .where(and(eq(bids.postId, post.id), bidVisibility))
      .orderBy(desc(bids.createdAt)),
    db
      .select({ pendingBidCount: count() })
      .from(bids)
      .where(and(eq(bids.postId, post.id), eq(bids.status, "PENDING"))),
  ]);

  const config = toFarmerDeliveryConfig(deliveryRow);
  const viewerLat = viewer?.latitude;
  const viewerLng = viewer?.longitude;
  const distanceKm =
    typeof viewerLat === "number" && typeof viewerLng === "number"
      ? calculateHaversineDistanceKm(viewerLat, viewerLng, post.latitude, post.longitude)
      : null;

  return {
    id: post.id,
    type: post.type,
    title: post.title,
    commodityName: post.commodityName,
    category: post.category,
    description: post.description,
    imageUrls: post.imageUrls,
    address: post.address,
    latitude: post.latitude,
    longitude: post.longitude,
    totalQuotaKg: post.totalQuotaKg,
    remainingQuotaKg: post.remainingQuotaKg,
    minOrderKg: post.minOrderKg,
    pricePerKgIdr: post.pricePerKgIdr,
    harvestOrNeededDate: post.harvestOrNeededDate,
    biddingDeadline: post.biddingDeadline,
    isOpen: post.isOpen,
    createdAt: post.createdAt,
    distanceKm,
    creator,
    farmerDelivery: config && {
      minCapacityKg: config.minCapacityKg,
      maxCapacityKg: config.maxCapacityKg,
      maxRadiusKm: config.maxRadiusKm,
      fixedDeliveryFeeIdr: config.fixedDeliveryFeeIdr,
    },
    isOwner,
    bids: visibleBids.map(({ bid, bidder }) => ({ ...bid, bidder })),
    pendingBidCount,
  };
}
