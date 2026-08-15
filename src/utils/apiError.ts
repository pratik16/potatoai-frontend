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
