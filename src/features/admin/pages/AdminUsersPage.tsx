import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminUsersQuery } from '../adminApi';
import { PageHeader, AdminTable, Skeleton, Pagination, PlanBadge, formatDate } from '../components/AdminShared';
import type { UserListParams } from '../../../types/admin.types';

export default function AdminUsersPage() {
  const [params, setParams] = useState<UserListParams>({ page: 1, per_page: 50 });
  const { data, isLoading } = useGetAdminUsersQuery(params);

  const set = (patch: Partial<UserListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  return (
    <div>
      <PageHeader title="Users" />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search name or email"
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        />
        <select
          onChange={(e) => set({ plan: e.target.value || undefined })}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
        {data?.meta && (
          <span className="self-center text-xs text-gray-500">{data.meta.total} users</span>
        )}
      </div>

      <AdminTable
        headers={['User', 'Plan', 'Balance', 'Messages (mo)', 'Credits Used (mo)', 'Status', 'Joined', 'Actions']}
        empty={!isLoading && !data?.data.length}
      >
        {isLoading ? (
          <Skeleton rows={8} cols={8} />
        ) : (
          data?.data.map((user) => (
            <tr key={user.id} className="hover:bg-gray-900/50">
              <td className="px-4 py-3">
                <Link to={`/admin/users/${user.id}`} className="font-medium text-white hover:text-purple-400">
                  {user.name}
                </Link>
                <div className="text-xs text-gray-500">{user.email}</div>
              </td>
              <td className="px-4 py-3"><PlanBadge plan={user.plan} /></td>
              <td className="px-4 py-3 text-gray-300">{(user.credit_balance ?? 0).toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-400">{user.messages_this_month ?? '—'}</td>
              <td className="px-4 py-3 text-gray-400">{user.credits_used_this_month?.toFixed(2) ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={user.is_suspended ? 'text-red-400' : 'text-green-400'}>
                  {user.is_suspended ? 'Suspended' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3">
                <Link to={`/admin/users/${user.id}`} className="text-xs text-purple-400 hover:text-purple-300">
                  View
                </Link>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      <Pagination meta={data?.meta} onChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
