import { useState } from 'react';
import { useGetRevenueQuery, useGetUsageAnalyticsQuery } from '../adminApi';
import { PageHeader, StatCard, currentMonth } from '../components/AdminShared';

export default function AdminAnalyticsPage() {
  const [month, setMonth]      = useState(currentMonth());
  const { data: revenue }      = useGetRevenueQuery({ month });
  const { data: usage }        = useGetUsageAnalyticsQuery({ month });

  const maxMessages = Math.max(...(usage?.daily.map((d) => d.messages) ?? [1]), 1);

  return (
    <div>
      <PageHeader
        title="Analytics"
        action={
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        }
      />

      {/* Revenue cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Provider Cost (USD)"  value={`$${revenue?.provider_cost.total_usd ?? 0}`} />
        <StatCard label="Credits Granted"      value={revenue?.credits_granted.toFixed(2)} />
        <StatCard label="Credits Spent"        value={revenue?.credits_spent.toFixed(2)} />
        <StatCard
          label="Gross Margin"
          value={
            revenue && revenue.provider_cost.total_usd > 0
              ? `${(((revenue.credits_spent * 0.001) - revenue.provider_cost.total_usd) / (revenue.credits_spent * 0.001) * 100).toFixed(1)}%`
              : '—'
          }
        />
      </div>

      {/* Provider cost by model */}
      {!!revenue?.provider_cost.by_model?.length && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-white">Provider Cost by Model</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Model</th>
                  <th className="px-4 py-3 text-left">Cost (USD)</th>
                  <th className="px-4 py-3 text-left">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950">
                {revenue.provider_cost.by_model.map((row) => (
                  <tr key={row.model}>
                    <td className="px-4 py-3 text-white">{row.model}</td>
                    <td className="px-4 py-3 text-gray-300">${row.cost_usd.toFixed(4)}</td>
                    <td className="px-4 py-3 text-gray-400">{row.tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily messages bar chart */}
      {!!usage?.daily.length && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-white">Daily Messages</h3>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-end gap-1" style={{ height: 120 }}>
              {usage.daily.map((d) => (
                <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                  <div
                    title={`${d.date}: ${d.messages} messages`}
                    className="w-full rounded-t bg-purple-700/70 transition-colors hover:bg-purple-600"
                    style={{ height: `${(d.messages / maxMessages) * 100}%`, minHeight: d.messages > 0 ? 2 : 0 }}
                  />
                  <span className="text-xs text-gray-600">{d.date.slice(8)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usage by model */}
      {!!usage?.by_model.length && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-white">Usage by Model</h3>
          <div className="space-y-2">
            {usage.by_model.map((m) => (
              <div key={m.model} className="flex items-center gap-3">
                <span className="w-36 truncate text-sm text-gray-300">{m.model}</span>
                <div className="flex-1 rounded-full bg-gray-800" style={{ height: 8 }}>
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
                <span className="w-20 text-right text-xs text-gray-500">
                  {m.messages} ({m.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
