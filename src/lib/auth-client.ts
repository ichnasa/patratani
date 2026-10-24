import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

/**
 * Browser-side Better Auth client for Client Components.
 * Same-origin, so no baseURL needed. `inferAdditionalFields` types
 * `role`, `phone`, etc. on sign-up and `useSession()`.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
