import { useGetDashboardQuery } from '../adminApi';
import { PageHeader, StatCard, MiniCard } from '../components/AdminShared';

export default function AdminDashboardPage() {
  const { data, isLoading, refetch } = useGetDashboardQuery(undefined, { pollingInterval: 60_000 });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <button
            onClick={refetch}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
          >
            ↺ Refresh
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Credits Granted (month)"  value={data?.credits.granted_this_month.toFixed(2)} />
            <StatCard label="Credits Spent (month)"    value={data?.credits.spent_this_month.toFixed(2)} />
            <StatCard label="Credits Remaining"        value={data?.credits.remaining_pool.toFixed(2)} />
            <StatCard label="Provider Cost (USD)"      value={`$${data?.cost.provider_cost_usd_this_month}`} />
            <StatCard label="Est. Revenue (USD)"       value={`$${data?.cost.estimated_revenue_usd}`} />
            <StatCard
              label="Gross Margin"
              value={`${data?.cost.gross_margin_percent ?? 0}%`}
              sub={data?.cost.gross_margin_percent != null && data.cost.gross_margin_percent < 20 ? '⚠️ Low margin' : undefined}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniCard label="Total Users"    value={data?.users.total_registered} />
            <MiniCard label="Active Today"   value={data?.users.active_today} />
            <MiniCard label="Messages Today" value={data?.messages.sent_today} />
            <MiniCard label="Messages / Mo"  value={data?.messages.sent_this_month} />
          </div>
        </>
      )}
    </div>
  );
}
