import { Link } from 'react-router-dom';
import { useGetAdminModelsQuery, useToggleModelMutation } from '../adminApi';
import { PageHeader, Toggle, AdminTable, Skeleton, formatDate } from '../components/AdminShared';
import type { AdminModel } from '../../../types/admin.types';

export default function AdminModelsPage() {
  const { data: models, isLoading } = useGetAdminModelsQuery();
  const [toggleModel] = useToggleModelMutation();

  const handle = (model: AdminModel, field: 'is_active' | 'is_pro_only', val: boolean) => {
    toggleModel({ id: model.id, patch: { [field]: val } });
  };

  return (
    <div>
      <PageHeader title="AI Models" />
      <AdminTable
        headers={['Model', 'Provider', 'Active', 'Pro Only', 'Credits/1K in', 'Credits/1K out', 'Effective From', 'Actions']}
        empty={!isLoading && !models?.length}
      >
        {isLoading ? (
          <Skeleton rows={5} cols={8} />
        ) : (
          models?.map((m) => (
            <tr key={m.id} className="hover:bg-gray-900/50">
              <td className="px-4 py-3 font-medium text-white">
                <span style={{ color: m.colour_hex }}>●</span> {m.name}
              </td>
              <td className="px-4 py-3 text-gray-400">{m.provider}</td>
              <td className="px-4 py-3">
                <Toggle checked={m.is_active}  onChange={(v) => handle(m, 'is_active', v)} />
              </td>
              <td className="px-4 py-3">
                <Toggle checked={m.is_pro_only} onChange={(v) => handle(m, 'is_pro_only', v)} />
              </td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.credit_per_input_1k?.toFixed(4) ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.credit_per_output_1k?.toFixed(4) ?? '—'}</td>
              <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(m.active_pricing?.effective_from)}</td>
              <td className="px-4 py-3">
                <Link to={`/admin/pricing/${m.id}/edit`} className="text-xs text-purple-400 hover:text-purple-300">
                  Edit Pricing
                </Link>
                <Link to={`/admin/pricing/${m.id}/history`} className="ml-3 text-xs text-gray-400 hover:text-white">
                  History
                </Link>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
