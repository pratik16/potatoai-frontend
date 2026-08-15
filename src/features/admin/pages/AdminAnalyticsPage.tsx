import { useState } from 'react';
import { useGetCreditsConfigQuery, useGetRevenueQuery, useGetUsageAnalyticsQuery } from '../adminApi';
import { PageHeader, StatCard, currentMonth, formatCount, formatNumeric, num } from '../components/AdminShared';

export default function AdminAnalyticsPage() {
  const [month, setMonth]      = useState(currentMonth());
  const { data: revenue }      = useGetRevenueQuery({ month });
  const { data: usage }        = useGetUsageAnalyticsQuery({ month });
  const { data: config }       = useGetCreditsConfigQuery();

  const maxMessages = Math.max(...(usage?.daily.map((d) => num(d.messages)) ?? [1]), 1);

  // USD-per-credit is admin-editable on /admin/credits-config; hardcoding it
  // here silently desynced this figure from the rest of the panel.
  const usdPerCredit = num(config?.usd_per_credit);
  const creditRevenue = revenue ? num(revenue.credits_spent) * usdPerCredit : 0;
  const providerCost  = num(revenue?.provider_cost.total_usd);
  // Guard the divisor, not the numerator — the old check was on total_usd and
  // produced -Infinity% whenever cost was non-zero but nothing had been spent.
  const grossMargin = creditRevenue > 0
    ? `${((creditRevenue - providerCost) / creditRevenue * 100).toFixed(1)}%`
    : '—';

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
        <StatCard label="Provider Cost (USD)"  value={`$${providerCost.toFixed(2)}`} />
        <StatCard label="Credits Granted"      value={formatNumeric(revenue?.credits_granted)} />
        <StatCard label="Credits Spent"        value={formatNumeric(revenue?.credits_spent)} />
        <StatCard
          label="Gross Margin"
          value={grossMargin}
          sub={usdPerCredit > 0 ? `at $${usdPerCredit} / credit` : undefined}
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
                    <td className="px-4 py-3 text-gray-300">${formatNumeric(row.cost_usd, 4)}</td>
                    <td className="px-4 py-3 text-gray-400">{formatCount(row.tokens)}</td>
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
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Daily Messages</h3>
            <span className="text-xs text-gray-500">
              {formatCount(usage.daily.reduce((s, d) => s + num(d.input_tokens), 0))} in ·{' '}
              {formatCount(usage.daily.reduce((s, d) => s + num(d.output_tokens), 0))} out tokens
            </span>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-end gap-1" style={{ height: 120 }}>
              {usage.daily.map((d) => (
                <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                  <div
                    title={
                      `${d.date}: ${formatCount(d.messages)} messages · ` +
                      `${formatCount(d.input_tokens)} in / ${formatCount(d.output_tokens)} out tokens`
                    }
                    className="w-full rounded-t bg-purple-700/70 transition-colors hover:bg-purple-600"
                    style={{
                      height: `${(num(d.messages) / maxMessages) * 100}%`,
                      minHeight: num(d.messages) > 0 ? 2 : 0,
                    }}
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
