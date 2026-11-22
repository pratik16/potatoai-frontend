import { useState } from 'react';
import { Clock } from 'lucide-react';

interface ThrottleNoticeProps {
  secondsLeft: number;
}

/**
 * "Too many attempts, try again in N seconds" under an auth form.
 *
 * The visible line ticks every second, so it is hidden from screen readers;
 * a separate alert announces the starting value once instead of every tick.
 */
export function ThrottleNotice({ secondsLeft }: ThrottleNoticeProps) {
  const [announced] = useState(secondsLeft);
  if (secondsLeft <= 0) return null;

  const unit = (n: number) => `${n} second${n === 1 ? '' : 's'}`;

  return (
    <div data-testid="auth-throttle-notice">
      <p role="alert" className="sr-only">
        Too many attempts. Try again in {unit(announced)}.
      </p>
      <p aria-hidden="true" className="flex items-center gap-2 text-sm text-red-400">
        <Clock className="h-4 w-4 shrink-0" />
        Too many attempts, try again in {unit(secondsLeft)}.
      </p>
    </div>
  );
}
