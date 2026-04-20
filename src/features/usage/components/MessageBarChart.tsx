import type { DailyUsage } from '../../../types/usage.types';
import { format, parseISO } from 'date-fns';

export function MessageBarChart({ data }: { data: DailyUsage[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">Messages per day</h3>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>

      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {data.slice(-7).map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-potato-600/70 hover:bg-potato-600 transition-colors"
              style={{ height: `${(d.count / max) * 100}%` }}
            />
            <span className="text-xs text-gray-600">{format(parseISO(d.date), 'EEE')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
