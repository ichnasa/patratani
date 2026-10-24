import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { USER_ROLES, type UserRole } from "@/contracts/patra-tani.contract";

/** Roles a user may pick at sign-up. ADMIN is granted only via the database. */
const SELF_ASSIGNABLE_ROLES: readonly UserRole[] = ["FARMER", "BUYER"];

/** Fields that must never change through Better Auth's public `/update-user`. */
const PROTECTED_USER_FIELDS = ["role", "walletBalanceIdr", "ratingAvg", "ratingCount"] as const;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // Tables are named users/sessions/accounts/verifications.
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  user: {
    additionalFields: {
      role: {
        type: [...USER_ROLES],
        required: false,
        defaultValue: "BUYER",
        // Accepted at sign-up so users can choose FARMER/BUYER; guarded below.
        input: true,
      },
      businessName: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      latitude: { type: "number", required: false, input: true },
      longitude: { type: "number", required: false, input: true },
      walletBalanceIdr: {
        type: "number",
        required: false,
        defaultValue: 0,
        // Only the escrow/ledger logic may move money.
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = (user as { role?: unknown }).role ?? "BUYER";
          if (!SELF_ASSIGNABLE_ROLES.includes(role as UserRole)) {
            throw new APIError("BAD_REQUEST", {
              message: "Peran hanya boleh FARMER atau BUYER.",
            });
          }
          return { data: { ...user, role } };
        },
      },
      update: {
        before: async (data, ctx) => {
          if (
            ctx?.path === "/update-user" &&
            PROTECTED_USER_FIELDS.some((field) => field in data)
          ) {
            throw new APIError("FORBIDDEN", {
              message: "Field ini tidak dapat diubah.",
            });
          }
          return { data };
        },
      },
    },
  },

  // Must stay last: lets Server Actions set auth cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
export type SessionUser = AuthSession["user"];
