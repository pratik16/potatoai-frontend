import { Zap } from 'lucide-react';
import { useGetUsageQuery } from '../features/usage/usageApi';
import { useAppSelector } from '../app/hooks';
import { StatsCard } from '../features/usage/components/StatsCard';
import { PlanCard } from '../features/usage/components/PlanCard';
import { MessageBarChart } from '../features/usage/components/MessageBarChart';
import { ModelUsageChart } from '../features/usage/components/ModelUsageChart';
import { ActivityTable } from '../features/usage/components/ActivityTable';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function UsagePage() {
  const { data, isLoading } = useGetUsageQuery();
  const creditBalance = useAppSelector((s) => s.auth.user?.credit_balance ?? 0);

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Spinner /></div>;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Usage &amp; Credits</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">Apr 2025 ▾</Button>
          <Button size="sm"><Zap className="h-4 w-4" /> Buy credits</Button>
        </div>
      </div>

      <PlanCard balance={creditBalance} />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Total chats this month"   value={data?.stats.total_chats ?? 0}    trend="+23%" />
        <StatsCard label="Total messages sent"       value={data?.stats.total_messages ?? 0} trend="+18%" />
        <StatsCard label="Credits used"              value={data?.stats.credits_used ?? '∞'}       />
        <StatsCard label="Most used model"           value={data?.stats.most_used_model ?? '—'}    color="#F59E0B" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MessageBarChart data={data?.daily_messages ?? []} />
        </div>
        <div className="lg:col-span-2">
          <ModelUsageChart data={data?.by_model ?? []} />
        </div>
      </div>

      <div className="mt-4">
        <ActivityTable />
      </div>
    </div>
  );
}
