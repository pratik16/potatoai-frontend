import { useState } from 'react';
import { useGetAuditLogQuery } from '../adminApi';
import { PageHeader, AdminTable, Skeleton, Pagination, AuditDiffViewer, formatDateTime } from '../components/AdminShared';
import type { AuditLogParams } from '../../../types/admin.types';

export default function AdminAuditPage() {
  const [params, setParams] = useState<AuditLogParams>({ page: 1, per_page: 50 });
  const { data, isLoading }  = useGetAuditLogQuery(params);

  const set = (patch: Partial<AuditLogParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  return (
    <div>
      <PageHeader title="Audit Log" />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Filter by action"
          onChange={(e) => set({ action: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />
        <input
          placeholder="Filter by IP"
          onChange={(e) => set({ ip: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />
        <input
          type="date"
          onChange={(e) => set({ from: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />
        <input
          type="date"
          onChange={(e) => set({ to: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />
      </div>

      <AdminTable
        headers={['Time', 'IP', 'Action', 'Entity', 'Changes']}
        empty={!isLoading && !data?.data.length}
      >
        {isLoading ? (
          <Skeleton rows={8} cols={5} />
        ) : (
          data?.data.map((log) => (
            <tr key={log.id} className="hover:bg-gray-900/50">
              <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(log.created_at)}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-300">{log.ip_address}</td>
              <td className="px-4 py-3">
                <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-purple-300">{log.action}</code>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {log.entity_type} <span className="text-gray-600">#{log.entity_id}</span>
              </td>
              <td className="px-4 py-3">
                <AuditDiffViewer old={log.old_values} next={log.new_values} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      <Pagination meta={data?.meta} onChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
