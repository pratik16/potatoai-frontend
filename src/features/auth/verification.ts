import type { NavigateFunction } from 'react-router-dom';
import type { ApiErrorBody } from '../../utils/apiError';

/** Survives a reload of /verify-email, where router `state` does not. */
export const PENDING_VERIFICATION_EMAIL_KEY = 'pending_verification_email';

/** The one code that sends a user to the verify screen. Branch on this, never on copy. */
export function isEmailNotVerified(status: number | undefined | null, data: ApiErrorBody | null | undefined): boolean {
  return status === 403 && data?.code === 'EMAIL_NOT_VERIFIED';
}

/**
 * Route to the verify screen the way the contract asks: `/verify-email` with
 * `state: { email }` (replica/contracts/phase0b-auth.md §1, §3). The address
 * also goes into the query and sessionStorage so a reload still shows it.
 */
export function goToVerifyEmail(
  navigate: NavigateFunction,
  email: string | null | undefined,
  options: { replace?: boolean } = {},
): void {
  const trimmed = email?.trim() || '';
  try {
    if (trimmed) sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, trimmed);
  } catch { /* storage blocked: the router state still carries it */ }

  navigate(`/verify-email${trimmed ? `?email=${encodeURIComponent(trimmed)}` : ''}`, {
    replace: options.replace ?? false,
    state:   { email: trimmed },
  });
}
