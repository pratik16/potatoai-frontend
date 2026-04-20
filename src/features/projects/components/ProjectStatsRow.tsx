interface Props { totalProjects: number; totalChats: number; creditsUsed: number; }

export function ProjectStatsRow({ totalProjects, totalChats, creditsUsed }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[
        { label: 'Total projects', value: totalProjects },
        { label: 'Total chats',    value: totalChats    },
        { label: 'Credits used',   value: creditsUsed   },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-surface-3 bg-surface-1 p-4">
          <p className="text-xs text-gray-500">{s.label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
