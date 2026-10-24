import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import {
  actionFail,
  actionOk,
  actionValidationFail,
  type ActionErrorCode,
  type ActionResult,
} from "@/contracts/patra-tani.contract";

/**
 * Expected, user-facing failure. Throw it anywhere inside an action
 * (guards, services, transactions) and `safeActionClient` turns it into
 * `{ success: false, error }`. Its message is shown to the user as-is.
 */
export class AppError extends Error {
  constructor(
    readonly code: ActionErrorCode,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** DB constraint names (see src/db/schema) mapped to user-facing errors. */
const CONSTRAINT_ERRORS: Record<string, { code: ActionErrorCode; message: string }> = {
  market_posts_quota_bounds: {
    code: "QUOTA_EXCEEDED",
    message: "Sisa kuota tidak mencukupi.",
  },
  bids_one_pending_per_bidder: {
    code: "CONFLICT",
    message: "Anda sudah memiliki penawaran aktif untuk postingan ini.",
  },
  users_wallet_balance_non_negative: {
    code: "CONFLICT",
    message: "Saldo tidak mencukupi.",
  },
  reviews_one_per_reviewer_per_order: {
    code: "CONFLICT",
    message: "Anda sudah memberi ulasan untuk pesanan ini.",
  },
  disputes_order_id_unique: {
    code: "CONFLICT",
    message: "Sengketa untuk pesanan ini sudah dibuka.",
  },
};

// postgres.js exposes `constraint_name`; node-postgres/PGlite expose `constraint`.
type PgErrorLike = { code: string; constraint_name?: string; constraint?: string; detail?: string };

/** Drizzle wraps driver errors; walk the `cause` chain to the postgres.js error. */
function findPgError(err: unknown): PgErrorLike | null {
  for (let e = err, depth = 0; e && depth < 5; e = (e as { cause?: unknown }).cause, depth++) {
    const candidate = e as Partial<PgErrorLike> & { severity?: unknown };
    if (typeof candidate.code === "string" && candidate.severity !== undefined) {
      return candidate as PgErrorLike;
    }
  }
  return null;
}

function toActionFailure(err: unknown): ActionResult<never> {
  if (err instanceof AppError) {
    return actionFail(err.code, err.message, err.fieldErrors);
  }
  if (err instanceof z.ZodError) {
    return actionValidationFail(err);
  }

  const pg = findPgError(err);
  if (pg) {
    const constraint = pg.constraint_name ?? pg.constraint;
    const mapped = constraint ? CONSTRAINT_ERRORS[constraint] : undefined;
    if (mapped) return actionFail(mapped.code, mapped.message);
    // 23505 unique_violation, 23514 check_violation, 40001 serialization_failure
    if (pg.code === "23505" || pg.code === "23514" || pg.code === "40001") {
      console.error("[action] constraint violation", { code: pg.code, constraint, detail: pg.detail });
      return actionFail("CONFLICT", "Data berubah atau bertentangan. Muat ulang lalu coba lagi.");
    }
  }

  console.error("[action] unexpected error", err);
  return actionFail("INTERNAL_ERROR", "Terjadi kesalahan pada server. Silakan coba lagi.");
}

/**
 * Wraps a Server Action body: validates input with `schema`, runs `handler`,
 * and always resolves to an `ActionResult<T>` (never throws to the client),
 * except for Next.js control-flow errors from redirect()/notFound().
 *
 * Usage inside a "use server" file:
 *   export const createPost = safeActionClient(CreateMarketPostInputSchema, async (input) => {
 *     const user = await requireAuth(["FARMER", "BUYER"]);
 *     ...
 *     return { id };
 *   });
 */
export function safeActionClient<TSchema extends z.ZodType, TOutput>(
  schema: TSchema,
  handler: (input: z.output<TSchema>) => Promise<TOutput>,
): (input: z.input<TSchema>) => Promise<ActionResult<TOutput>> {
  return async (rawInput) => {
    try {
      const parsed = await schema.safeParseAsync(rawInput);
      if (!parsed.success) return actionValidationFail(parsed.error);
      return actionOk(await handler(parsed.data));
    } catch (err) {
      unstable_rethrow(err);
      return toActionFailure(err);
    }
  };
}
