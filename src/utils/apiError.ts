/**
 * The error envelope every API endpoint shares — see `backend/CLAUDE.md` §1.
 *
 * Branch on `code`, never on `message` / `detail`: the copy is human-facing and
 * will change (and eventually be localised); the code is the contract.
 */
export interface ApiErrorBody {
  code?:    string;
  message?: string;
  detail?:  string;
  /** Present only on 422 `VALIDATION_ERROR`, keyed by field name. */
  errors?:  Record<string, string[]>;
  /** 429s: seconds until the limit resets (TOO_MANY_ATTEMPTS, msg/img RATE_LIMIT_EXCEEDED). */
  retry_after_seconds?: number;
  /** 429s from the generic RateLimiter middleware use this older key for the same thing. */
  retry_after?: number;
}

export interface ApiError {
  status?: number;
  data?:   ApiErrorBody;
}

export function asApiError(err: unknown): ApiError {
  return (err ?? {}) as ApiError;
}

/** Text for a single flat error line. Display only — do not branch on it. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const { data } = asApiError(err);
  return data?.message ?? data?.detail ?? fallback;
}

/**
 * First validation message per field, ready to hand to `<Input error={...} />`.
 * Empty unless the API returned `VALIDATION_ERROR`, so a caller can always
 * render both this and a flat fallback message.
 */
export function apiFieldErrors(err: unknown): Record<string, string> {
  const { data } = asApiError(err);
  if (!data?.errors) return {};

  return Object.fromEntries(
    Object.entries(data.errors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages[0]]),
  );
}

/**
 * Seconds until a 429 resets, whichever key the endpoint used. `null` when the
 * body carries neither (e.g. a mid-stream provider rate limit), so callers can
 * omit the "resets at" line instead of inventing a time.
 */
export function retryAfterSeconds(data: ApiErrorBody | null | undefined): number | null {
  const raw = data?.retry_after_seconds ?? data?.retry_after;
  const n = typeof raw === 'string' ? Number(raw) : raw;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
}
