import { useCallback } from 'react';
import { useCooldown } from '../../hooks/useCooldown';
import { asApiError, retryAfterSeconds } from '../../utils/apiError';

/** Used only if a 429 TOO_MANY_ATTEMPTS ever arrives without `retry_after_seconds`. */
const FALLBACK_SECONDS = 60;

/**
 * Client side of the auth throttle (replica/contracts/phase0b-auth.md §4).
 *
 * Login, register, forgot/reset password and resend-verification all answer a
 * burst with 429 `TOO_MANY_ATTEMPTS` + `retry_after_seconds`. Each form calls
 * `catchThrottle(err)` first in its catch block; when it returns true the form
 * shows <ThrottleNotice> and keeps its submit disabled until the countdown ends.
 */
export function useAuthThrottle() {
  const { secondsLeft, active, start } = useCooldown();

  const catchThrottle = useCallback((err: unknown): boolean => {
    const { data } = asApiError(err);
    if (data?.code !== 'TOO_MANY_ATTEMPTS') return false;
    start(retryAfterSeconds(data) ?? FALLBACK_SECONDS);
    return true;
  }, [start]);

  return { isThrottled: active, secondsLeft, catchThrottle };
}
