"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  FarmerDeliveryConfigInputSchema,
  UpdateProfileInputSchema,
} from "@/contracts/patra-tani.contract";
import { db } from "@/db";
import { farmerDeliveryConfigs, users } from "@/db/schema";
import { safeActionClient } from "@/lib/action-handler";
import { requireAuth } from "@/lib/auth-guard";

/** UC-01: any signed-in user edits their own profile. Role is never touched here. */
export const updateProfileAction = safeActionClient(UpdateProfileInputSchema, async (input) => {
  const user = await requireAuth();

  const [profile] = await db
    .update(users)
    .set({
      name: input.name,
      phone: input.phone,
      // Optional text field: an empty value clears it.
      businessName: input.businessName ?? null,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      // Avatar is uploaded separately; only overwrite when a new one is sent.
      ...(input.image ? { image: input.image } : {}),
    })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      name: users.name,
      phone: users.phone,
      businessName: users.businessName,
      address: users.address,
      latitude: users.latitude,
      longitude: users.longitude,
      image: users.image,
    });

  revalidatePath("/", "layout");
  return profile;
});

/**
 * UC-02: FARMER enables/disables optional FARMER_DELIVERY.
 * Disabling keeps the previous limits so the form can prefill on re-enable.
 * Pending bids are re-checked against the latest config when accepted.
 */
export const updateFarmerDeliveryConfigAction = safeActionClient(
  FarmerDeliveryConfigInputSchema,
  async (input) => {
    const user = await requireAuth(["FARMER"]);

    const values = input.isDeliveryEnabled
      ? {
          isDeliveryEnabled: true,
          minCapacityKg: input.minCapacityKg,
          maxCapacityKg: input.maxCapacityKg,
          maxRadiusKm: input.maxRadiusKm,
          fixedDeliveryFeeIdr: input.fixedDeliveryFeeIdr,
        }
      : { isDeliveryEnabled: false };

    const [config] = await db
      .insert(farmerDeliveryConfigs)
      .values({ userId: user.id, ...values })
      .onConflictDoUpdate({ target: farmerDeliveryConfigs.userId, set: values })
      .returning();

    revalidatePath("/", "layout");
    return config;
  },
);
