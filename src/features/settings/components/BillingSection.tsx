import { useCredits } from '../../../hooks/useCredits';
import { Button } from '../../../components/ui/Button';

export function BillingSection() {
  const { plan, balance } = useCredits();

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Billing</h2>
      <p className="mb-6 text-sm text-gray-400">Manage your subscription and billing details.</p>

      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current plan</p>
            <p className="font-semibold text-white capitalize">{plan} Plan</p>
          </div>
          <Button size="sm">Manage plan</Button>
        </div>
        <div className="mt-4 border-t border-surface-3 pt-4">
          <p className="text-sm text-gray-400">Credits remaining</p>
          <p className="mt-1 text-2xl font-bold text-potato-400">
            {plan === 'pro' ? '∞ Unlimited' : balance.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}
