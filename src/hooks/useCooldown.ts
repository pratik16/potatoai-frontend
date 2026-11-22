import { useCallback, useEffect, useState } from 'react';

/**
 * A one-second countdown, used for "try again in N seconds" after a 429.
 *
 * Stores an absolute deadline rather than decrementing a counter, so a
 * backgrounded tab (where timers are throttled) still shows the right number
 * the moment it wakes up.
 */
export function useCooldown() {
  const [until, setUntil] = useState<number | null>(null);
  const [now, setNow]     = useState(() => Date.now());

  useEffect(() => {
    if (until === null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) setUntil(null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [until]);

  const start = useCallback((seconds: number) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + Math.max(1, seconds) * 1000);
  }, []);

  const secondsLeft = until === null ? 0 : Math.max(0, Math.ceil((until - now) / 1000));

  return { secondsLeft, active: secondsLeft > 0, start };
}
