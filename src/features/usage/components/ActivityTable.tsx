export function ActivityTable() {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-white">Recent activity</h3>
        <button className="text-xs text-potato-500 hover:text-potato-400">Export CSV →</button>
      </div>
      <p className="text-sm text-gray-500">No activity yet this month.</p>
    </div>
  );
}
