/**
 * Patra Tani — Shared Backend/Frontend Contract
 *
 * Single source of truth for enums, validation schemas, DTOs and the
 * standardized Server Action return shape. Safe to import from both
 * Server Actions and Client Components (no server-only dependencies).
 */
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                   ENUMS                                    */
/* -------------------------------------------------------------------------- */
// Tuples are exported so Drizzle `pgEnum(name, VALUES)` stays in sync.

export const USER_ROLES = ["FARMER", "BUYER", "ADMIN"] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;
export const UserRole = UserRoleSchema.enum;

export const MARKET_POST_TYPES = ["ETALASE_PANEN", "TENDER_PERMINTAAN"] as const;
export const MarketPostTypeSchema = z.enum(MARKET_POST_TYPES);
export type MarketPostType = z.infer<typeof MarketPostTypeSchema>;
export const MarketPostType = MarketPostTypeSchema.enum;

export const COMMODITY_CATEGORIES = [
  "SAYURAN",
  "BUAH",
  "UMBI_UMBIAN",
  "CABAI_BAWANG",
  "BUMBU_REMPAH",
  "BERAS_BIJI_BIJIAN",
  "LAINNYA",
] as const;
export const CommodityCategorySchema = z.enum(COMMODITY_CATEGORIES);
export type CommodityCategory = z.infer<typeof CommodityCategorySchema>;
export const CommodityCategory = CommodityCategorySchema.enum;

export const DELIVERY_METHODS = ["SELF_PICKUP", "FARMER_DELIVERY"] as const;
export const DeliveryMethodSchema = z.enum(DELIVERY_METHODS);
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>;
export const DeliveryMethod = DeliveryMethodSchema.enum;

export const ORDER_STATUSES = [
  "OPEN",
  "BIDDING",
  "AWARDED",
  "PAID_HELD",
  "HANDOVER",
  "COMPLETED",
  "DISPUTED",
  "CANCELED_H1",
] as const;
export const OrderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export const OrderStatus = OrderStatusSchema.enum;

export const BID_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export const BidStatusSchema = z.enum(BID_STATUSES);
export type BidStatus = z.infer<typeof BidStatusSchema>;
export const BidStatus = BidStatusSchema.enum;

export const WALLET_TRANSACTION_TYPES = [
  "TOP_UP",
  "ESCROW_HOLD",
  "ESCROW_REFUND",
  "PAYOUT_RELEASE",
  "PLATFORM_COMMISSION",
  "WITHDRAWAL",
] as const;
export const WalletTransactionTypeSchema = z.enum(WALLET_TRANSACTION_TYPES);
export type WalletTransactionType = z.infer<typeof WalletTransactionTypeSchema>;
export const WalletTransactionType = WalletTransactionTypeSchema.enum;

/** Allowed state-machine transitions. Anything not listed is rejected. */
export const ORDER_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  OPEN: ["BIDDING", "AWARDED"],
  BIDDING: ["AWARDED"],
  AWARDED: ["PAID_HELD"],
  PAID_HELD: ["HANDOVER", "CANCELED_H1"],
  HANDOVER: ["COMPLETED", "DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELED_H1"],
  COMPLETED: [],
  CANCELED_H1: [],
};

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

/* -------------------------------------------------------------------------- */
/*                              BUSINESS CONSTANTS                            */
/* -------------------------------------------------------------------------- */

/** Pure commission, applied ONLY to `subtotalHarvestIdr`. */
export const PLATFORM_COMMISSION_PERCENT = 4;
/** Minimum Fixed Safe Quota for an ETALASE_PANEN post. */
export const MIN_SAFE_QUOTA_KG = 10;
/** Minimum quantity per pre-order / bid / tender request. */
export const MIN_ORDER_KG = 10;
export const MAX_POST_IMAGES = 5;
export const HANDOVER_EVIDENCE_BUCKET = "handover-evidence";

/**
 * Settlement on COMPLETED. Delivery fee goes 100% uncut to the farmer.
 * All amounts are integer IDR.
 */
export function calculateOrderSettlement(
  subtotalHarvestIdr: number,
  deliveryFeeIdr: number,
) {
  const platformCommissionIdr = Math.round(
    (subtotalHarvestIdr * PLATFORM_COMMISSION_PERCENT) / 100,
  );
  return {
    totalEscrowHeldIdr: subtotalHarvestIdr + deliveryFeeIdr,
    platformCommissionIdr,
    netFarmerPayoutIdr: subtotalHarvestIdr - platformCommissionIdr + deliveryFeeIdr,
  };
}

/* -------------------------------------------------------------------------- */
/*                               ACTION RESULT                                */
/* -------------------------------------------------------------------------- */

export const ACTION_ERROR_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "CONFLICT",
  "INVALID_STATE_TRANSITION",
  "QUOTA_EXCEEDED",
  "OUT_OF_DELIVERY_RANGE",
  "STORAGE_ERROR",
  "INTERNAL_ERROR",
] as const;
export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];

export type ActionError = {
  code: ActionErrorCode;
  message: string;
  /** Per-field messages, keyed by input field path (e.g. "quantityKg"). */
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ActionError };

export function actionOk<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

export function actionFail(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { success: false, error: { code, message, fieldErrors } };
}

/** Converts a failed Zod parse into a VALIDATION_ERROR ActionResult. */
export function actionValidationFail(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return actionFail("VALIDATION_ERROR", "Data yang dikirim tidak valid.", fieldErrors);
}

/* -------------------------------------------------------------------------- */
/*                              PRIMITIVE SCHEMAS                             */
/* -------------------------------------------------------------------------- */

/** Treats "" / null from forms & searchParams as "not provided". */
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const idSchema = z.string().uuid("ID tidak valid.");
// Empty form values must count as missing: z.coerce.number("") would yield 0.
const latitudeSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ message: "Latitude wajib diisi." }).min(-90).max(90),
);
const longitudeSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ message: "Longitude wajib diisi." }).min(-180).max(180),
);
const idrSchema = z.coerce.number().int("Nominal harus bilangan bulat.").nonnegative();
const positiveIdrSchema = z.coerce.number().int("Nominal harus bilangan bulat.").positive();
const kgSchema = z.coerce.number().int("Berat harus bilangan bulat (kg).").positive();
const indonesianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor HP tidak valid.");

export const GeoPointSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;

/* -------------------------------------------------------------------------- */
/*                                   PROFILE                                  */
/* -------------------------------------------------------------------------- */

/** Role is intentionally NOT updatable here. Keys mirror `users` columns. */
export const UpdateProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: indonesianPhoneSchema,
  businessName: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  address: z.string().trim().min(10).max(500),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  image: z.preprocess(emptyToUndefined, z.string().url().optional()),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/* -------------------------------------------------------------------------- */
/*                          FARMER DELIVERY CONFIG                            */
/* -------------------------------------------------------------------------- */

const FarmerDeliveryEnabledSchema = z.object({
  isDeliveryEnabled: z.literal(true),
  minCapacityKg: kgSchema,
  maxCapacityKg: kgSchema,
  maxRadiusKm: z.coerce.number().int("Radius harus bilangan bulat (km).").positive().max(200),
  fixedDeliveryFeeIdr: idrSchema,
});

export const FarmerDeliveryConfigInputSchema = z
  .discriminatedUnion("isDeliveryEnabled", [
    z.object({ isDeliveryEnabled: z.literal(false) }),
    FarmerDeliveryEnabledSchema,
  ])
  .superRefine((cfg, ctx) => {
    if (cfg.isDeliveryEnabled && cfg.minCapacityKg > cfg.maxCapacityKg) {
      ctx.addIssue({
        code: "custom",
        path: ["maxCapacityKg"],
        message: "Kapasitas maksimum harus ≥ kapasitas minimum.",
      });
    }
  });
export type FarmerDeliveryConfigInput = z.infer<typeof FarmerDeliveryConfigInputSchema>;
/** Enabled variant — the shape consumed by geo/delivery rule checks. */
export type FarmerDeliveryConfig = z.infer<typeof FarmerDeliveryEnabledSchema>;

/* -------------------------------------------------------------------------- */
/*                                 MARKET POST                                */
/* -------------------------------------------------------------------------- */

const MarketPostBaseSchema = z.object({
  title: z.string().trim().min(5).max(120),
  commodityName: z.string().trim().min(2).max(80),
  category: CommodityCategorySchema,
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  address: z.string().trim().min(10).max(500),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  imageUrls: z.array(z.string().url()).max(MAX_POST_IMAGES).default([]),
});

/** Posted by FARMER. Price is fixed; buyers pre-order against the safe quota. */
const EtalasePanenPostSchema = MarketPostBaseSchema.extend({
  postType: z.literal("ETALASE_PANEN"),
  fixedSafeQuotaKg: kgSchema.min(MIN_SAFE_QUOTA_KG, `Kuota aman minimal ${MIN_SAFE_QUOTA_KG} kg.`),
  minOrderKg: kgSchema.min(MIN_ORDER_KG, `Minimal pesanan ${MIN_ORDER_KG} kg.`),
  pricePerKgIdr: positiveIdrSchema,
  estimatedHarvestDate: z.coerce.date(),
});

/** Posted by BUYER. Farmers bid with their own price per kg. */
const TenderPermintaanPostSchema = MarketPostBaseSchema.extend({
  postType: z.literal("TENDER_PERMINTAAN"),
  requestedQuantityKg: kgSchema.min(MIN_ORDER_KG, `Minimal permintaan ${MIN_ORDER_KG} kg.`),
  maxBudgetPerKgIdr: positiveIdrSchema,
  biddingDeadline: z.coerce.date(),
  neededByDate: z.coerce.date(),
});

export const CreateMarketPostInputSchema = z
  .discriminatedUnion("postType", [EtalasePanenPostSchema, TenderPermintaanPostSchema])
  .superRefine((post, ctx) => {
    const now = Date.now();
    if (post.postType === "ETALASE_PANEN") {
      if (post.minOrderKg > post.fixedSafeQuotaKg) {
        ctx.addIssue({
          code: "custom",
          path: ["minOrderKg"],
          message: "Minimal pesanan tidak boleh melebihi kuota aman.",
        });
      }
      if (post.estimatedHarvestDate.getTime() <= now) {
        ctx.addIssue({
          code: "custom",
          path: ["estimatedHarvestDate"],
          message: "Tanggal panen harus di masa depan.",
        });
      }
    } else {
      if (post.biddingDeadline.getTime() <= now) {
        ctx.addIssue({
          code: "custom",
          path: ["biddingDeadline"],
          message: "Batas penawaran harus di masa depan.",
        });
      }
      if (post.neededByDate.getTime() <= post.biddingDeadline.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["neededByDate"],
          message: "Tanggal kebutuhan harus setelah batas penawaran.",
        });
      }
    }
  });
export type CreateMarketPostInput = z.infer<typeof CreateMarketPostInputSchema>;

/* -------------------------------------------------------------------------- */
/*                               MARKET FILTERS                               */
/* -------------------------------------------------------------------------- */

export const MARKET_SORT_OPTIONS = [
  "NEWEST",
  "PRICE_ASC",
  "PRICE_DESC",
  "DISTANCE",
  "HARVEST_DATE",
] as const;

/** Parses URL searchParams; every field is optional and coerced. */
export const MarketFilterParamsSchema = z
  .object({
    postType: z.preprocess(emptyToUndefined, MarketPostTypeSchema.optional()),
    category: z.preprocess(emptyToUndefined, CommodityCategorySchema.optional()),
    q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
    minPricePerKgIdr: z.preprocess(emptyToUndefined, idrSchema.optional()),
    maxPricePerKgIdr: z.preprocess(emptyToUndefined, idrSchema.optional()),
    /** Only posts whose farmer offers FARMER_DELIVERY. */
    deliveryMethod: z.preprocess(emptyToUndefined, DeliveryMethodSchema.optional()),
    latitude: z.preprocess(emptyToUndefined, latitudeSchema.optional()),
    longitude: z.preprocess(emptyToUndefined, longitudeSchema.optional()),
    radiusKm: z.preprocess(emptyToUndefined, z.coerce.number().positive().max(500).optional()),
    sortBy: z.preprocess(emptyToUndefined, z.enum(MARKET_SORT_OPTIONS).default("NEWEST")),
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
    pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(20)),
  })
  .superRefine((f, ctx) => {
    const hasPoint = f.latitude !== undefined && f.longitude !== undefined;
    if ((f.radiusKm !== undefined || f.sortBy === "DISTANCE") && !hasPoint) {
      ctx.addIssue({
        code: "custom",
        path: ["latitude"],
        message: "Lokasi diperlukan untuk filter radius / urut jarak.",
      });
    }
    if (
      f.minPricePerKgIdr !== undefined &&
      f.maxPricePerKgIdr !== undefined &&
      f.minPricePerKgIdr > f.maxPricePerKgIdr
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPricePerKgIdr"],
        message: "Harga maksimum harus ≥ harga minimum.",
      });
    }
  });
export type MarketFilterParams = z.infer<typeof MarketFilterParamsSchema>;

/* -------------------------------------------------------------------------- */
/*                           BID / PRE-ORDER SUBMIT                           */
/* -------------------------------------------------------------------------- */
// Delivery fee and subtotal are NEVER accepted from the client; the server
// computes them from the post price and the farmer's delivery config.

/** BUYER pre-orders from an ETALASE_PANEN post at the farmer's fixed price. */
const PreOrderSchema = z.object({
  kind: z.literal("PRE_ORDER"),
  marketPostId: idSchema,
  quantityKg: kgSchema.min(MIN_ORDER_KG, `Minimal pesanan ${MIN_ORDER_KG} kg.`),
  deliveryMethod: DeliveryMethodSchema.default("SELF_PICKUP"),
  /** Required only for FARMER_DELIVERY: the buyer's drop-off point. */
  deliveryAddress: z.preprocess(emptyToUndefined, z.string().trim().min(10).max(500).optional()),
  deliveryLatitude: z.preprocess(emptyToUndefined, latitudeSchema.optional()),
  deliveryLongitude: z.preprocess(emptyToUndefined, longitudeSchema.optional()),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

/** FARMER bids on a TENDER_PERMINTAAN post; drop-off is the tender's location. */
const TenderBidSchema = z.object({
  kind: z.literal("TENDER_BID"),
  marketPostId: idSchema,
  quantityKg: kgSchema.min(MIN_ORDER_KG, `Minimal penawaran ${MIN_ORDER_KG} kg.`),
  offeredPricePerKgIdr: positiveIdrSchema,
  deliveryMethod: DeliveryMethodSchema.default("SELF_PICKUP"),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export const SubmitBidOrPreOrderInputSchema = z
  .discriminatedUnion("kind", [PreOrderSchema, TenderBidSchema])
  .superRefine((input, ctx) => {
    if (input.kind !== "PRE_ORDER" || input.deliveryMethod !== "FARMER_DELIVERY") return;
    for (const field of ["deliveryAddress", "deliveryLatitude", "deliveryLongitude"] as const) {
      if (input[field] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Wajib diisi untuk pengantaran oleh petani.",
        });
      }
    }
  });
export type SubmitBidOrPreOrderInput = z.infer<typeof SubmitBidOrPreOrderInputSchema>;

/* -------------------------------------------------------------------------- */
/*                               DISPUTE / REVIEW                             */
/* -------------------------------------------------------------------------- */

/** All-or-nothing: fixed nominal means no partial refunds. */
export const DISPUTE_RESOLUTIONS = ["RELEASE_TO_FARMER", "REFUND_TO_BUYER"] as const;
export const DisputeResolutionSchema = z.enum(DISPUTE_RESOLUTIONS);
export type DisputeResolution = z.infer<typeof DisputeResolutionSchema>;

export const ResolveDisputeInputSchema = z.object({
  orderId: idSchema,
  resolution: DisputeResolutionSchema,
  adminNotes: z.string().trim().min(20, "Catatan admin minimal 20 karakter.").max(2000),
});
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeInputSchema>;

export const SubmitReviewInputSchema = z.object({
  orderId: idSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});
export type SubmitReviewInput = z.infer<typeof SubmitReviewInputSchema>;

/* -------------------------------------------------------------------------- */
/*                               ORDER DETAIL DTO                             */
/* -------------------------------------------------------------------------- */

// Field names mirror the `orders` table columns where one exists.

const OrderPartySchema = z.object({
  id: z.string(),
  name: z.string(),
  businessName: z.string().nullable(),
  /** Exposed to the counterparty only from PAID_HELD onward. */
  phone: z.string().nullable(),
  image: z.string().nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number().int(),
});

const HandoverEvidenceDTOSchema = z.object({
  id: idSchema,
  uploadedByRole: UserRoleSchema,
  /** Short-lived signed URL from the private `handover-evidence` bucket. */
  photoUrl: z.string(),
  capturedLatitude: z.number(),
  capturedLongitude: z.number(),
  capturedAt: z.date(),
});

export const OrderDetailDTOSchema = z.object({
  id: idSchema,
  orderCode: z.string(),
  status: OrderStatusSchema,

  postId: idSchema,
  postType: MarketPostTypeSchema,
  commodityName: z.string(),
  category: CommodityCategorySchema,
  /** From the post's harvestOrNeededDate; H-1 is the day before. */
  scheduledHandoverDate: z.date(),

  farmer: OrderPartySchema,
  buyer: OrderPartySchema,

  fixedWeightKg: z.number().int(),
  agreedPricePerKgIdr: z.number().int(),
  subtotalHarvestIdr: z.number().int(),
  deliveryMethod: DeliveryMethodSchema,
  deliveryFeeIdr: z.number().int(),
  totalEscrowHeldIdr: z.number().int(),
  platformCommissionIdr: z.number().int(),
  netFarmerPayoutIdr: z.number().int(),

  pickupAddress: z.string(),
  pickupPoint: GeoPointSchema,
  deliveryAddress: z.string().nullable(),
  deliveryPoint: GeoPointSchema.nullable(),
  distanceKm: z.number().nullable(),

  isH1Confirmed: z.boolean().nullable(),
  h1Notes: z.string().nullable(),
  h1ConfirmedAt: z.date().nullable(),

  handoverEvidences: z.array(HandoverEvidenceDTOSchema),
  farmerConfirmedComplete: z.boolean(),
  buyerConfirmedComplete: z.boolean(),

  dispute: z
    .object({
      reason: z.string(),
      openedByUserId: z.string(),
      createdAt: z.date(),
      resolution: DisputeResolutionSchema.nullable(),
      adminNotes: z.string().nullable(),
      resolvedAt: z.date().nullable(),
    })
    .nullable(),

  /** The viewer's own review of this order, if submitted. */
  myReview: z
    .object({
      rating: z.number().int(),
      comment: z.string().nullable(),
      createdAt: z.date(),
    })
    .nullable(),

  createdAt: z.date(),
  paidAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  canceledAt: z.date().nullable(),
});
export type OrderDetailDTO = z.infer<typeof OrderDetailDTOSchema>;
