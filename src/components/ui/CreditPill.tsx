import { Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppSelector } from '../../app/hooks';

export function CreditPill() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  if (user.plan !== 'free') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-medium text-yellow-400">
        <Zap className="h-3 w-3" /> ∞
      </span>
    );
  }

  const balance = user.credit_balance ?? 0;

  return (
    <span className={clsx(
      'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
      balance <= 0   ? 'bg-red-900/60 text-red-300'    :
      balance < 10   ? 'bg-amber-900/60 text-amber-300' :
                       'bg-surface-3 text-white',
    )}>
      <Zap className={clsx(
        'h-3 w-3',
        balance <= 0  ? 'text-red-400'    :
        balance < 10  ? 'text-amber-400'  :
                        'text-yellow-400',
      )} />
      {balance.toFixed(0)} credits
    </span>
  );
}
