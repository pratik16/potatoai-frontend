interface Props { label: string; value: number | string; trend?: string; color?: string; }

export function StatsCard({ label, value, trend, color }: Props) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={color ? { color } : { color: 'white' }}>{value}</p>
      {trend && <p className="mt-1 text-xs text-green-400">{trend} vs last month</p>}
    </div>
  );
}
