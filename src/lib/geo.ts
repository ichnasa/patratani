import type { FarmerDeliveryConfig, GeoPoint } from "@/contracts/patra-tani.contract";

const EARTH_RADIUS_KM = 6371;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in kilometers. */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Maps a `farmer_delivery_configs` row (nullable columns) to the enabled
 * config shape, or null when delivery is off. The DB check constraint
 * guarantees all limits are set whenever `isDeliveryEnabled` is true.
 */
export function toFarmerDeliveryConfig(
  row:
    | {
        isDeliveryEnabled: boolean;
        minCapacityKg: number | null;
        maxCapacityKg: number | null;
        maxRadiusKm: number | null;
        fixedDeliveryFeeIdr: number | null;
      }
    | null
    | undefined,
): FarmerDeliveryConfig | null {
  if (
    !row?.isDeliveryEnabled ||
    row.minCapacityKg === null ||
    row.maxCapacityKg === null ||
    row.maxRadiusKm === null ||
    row.fixedDeliveryFeeIdr === null
  ) {
    return null;
  }
  return {
    isDeliveryEnabled: true,
    minCapacityKg: row.minCapacityKg,
    maxCapacityKg: row.maxCapacityKg,
    maxRadiusKm: row.maxRadiusKm,
    fixedDeliveryFeeIdr: row.fixedDeliveryFeeIdr,
  };
}

export type FarmerDeliveryRuleViolation =
  | "DELIVERY_DISABLED"
  | "BELOW_MIN_CAPACITY"
  | "ABOVE_MAX_CAPACITY"
  | "OUTSIDE_RADIUS";

export type FarmerDeliveryEligibility =
  | { allowed: true; distanceKm: number; deliveryFeeIdr: number }
  | { allowed: false; distanceKm: number | null; reason: FarmerDeliveryRuleViolation };

/**
 * Checks a FARMER_DELIVERY request against the farmer's own rules.
 * `config` is null when the farmer has not enabled delivery.
 * On success returns the farmer's fixed fee (never distance-based).
 */
export function isWithinFarmerDeliveryRules(params: {
  config: FarmerDeliveryConfig | null;
  quantityKg: number;
  farmerPoint: GeoPoint;
  dropOffPoint: GeoPoint;
}): FarmerDeliveryEligibility {
  const { config, quantityKg, farmerPoint, dropOffPoint } = params;

  if (!config?.isDeliveryEnabled) {
    return { allowed: false, distanceKm: null, reason: "DELIVERY_DISABLED" };
  }

  const distanceKm = calculateHaversineDistanceKm(
    farmerPoint.latitude,
    farmerPoint.longitude,
    dropOffPoint.latitude,
    dropOffPoint.longitude,
  );

  if (quantityKg < config.minCapacityKg) {
    return { allowed: false, distanceKm, reason: "BELOW_MIN_CAPACITY" };
  }
  if (quantityKg > config.maxCapacityKg) {
    return { allowed: false, distanceKm, reason: "ABOVE_MAX_CAPACITY" };
  }
  if (distanceKm > config.maxRadiusKm) {
    return { allowed: false, distanceKm, reason: "OUTSIDE_RADIUS" };
  }

  return { allowed: true, distanceKm, deliveryFeeIdr: config.fixedDeliveryFeeIdr };
}
