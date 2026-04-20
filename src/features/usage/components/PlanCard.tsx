import { Zap } from 'lucide-react';
import { useCredits } from '../../../hooks/useCredits';
import { Button } from '../../../components/ui/Button';

export function PlanCard({ balance }: { balance: number }) {
  const { plan } = useCredits();
  const isPro    = plan === 'pro';

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
              <Zap className="inline h-3 w-3 mr-1" />{isPro ? 'PRO PLAN' : 'FREE PLAN'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">{isPro ? 'Pro — Unlimited' : 'Free Plan'}</h2>
          <p className="text-sm text-gray-400">
            {isPro ? 'All 5 AI models · Unlimited credits · Priority speed' : `${balance.toFixed(0)} credits remaining`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{isPro ? '$12' : '$0'}<span className="text-sm font-normal text-gray-400">/mo</span></p>
          <Button size="sm" className="mt-2">{isPro ? 'Upgrade to Team →' : 'Upgrade to Pro'}</Button>
        </div>
      </div>
    </div>
  );
}
