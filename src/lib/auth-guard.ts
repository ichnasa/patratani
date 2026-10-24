import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import type { UserRole } from "@/contracts/patra-tani.contract";
import { AppError } from "@/lib/action-handler";
import { auth, type SessionUser } from "@/lib/auth";

export type { SessionUser };

/**
 * Current user or null. Deduplicated per request via React `cache`.
 * Reads the session from the DB (no cookie cache), so role changes apply immediately.
 */
export const getCurrentSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/**
 * Throws `AppError` (UNAUTHENTICATED / FORBIDDEN), which `safeActionClient`
 * converts into a failed `ActionResult`. Omit `allowedRoles` to allow any role.
 */
export async function requireAuth(allowedRoles?: readonly UserRole[]): Promise<SessionUser> {
  const user = await getCurrentSessionUser();
  if (!user) {
    throw new AppError("UNAUTHENTICATED", "Silakan masuk terlebih dahulu.");
  }
  if (allowedRoles?.length && !allowedRoles.includes(user.role as UserRole)) {
    throw new AppError("FORBIDDEN", "Anda tidak memiliki akses untuk tindakan ini.");
  }
  return user;
}
