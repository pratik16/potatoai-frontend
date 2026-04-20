import type { ModelUsage } from '../../../types/usage.types';
import { MODEL_COLORS } from '../../../utils/modelConfig';

export function ModelUsageChart({ data }: { data: ModelUsage[] }) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">Usage by model</h3>
        <span className="text-xs text-gray-500">This month</span>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((d) => {
          const color = MODEL_COLORS[d.model] ?? '#8b5cf6';
          return (
            <div key={d.model} className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="w-24 truncate text-sm text-white">{d.model.split('/').pop()}</span>
              <div className="flex-1 rounded-full bg-surface-3 h-1.5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${d.percent}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-400">{d.percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
