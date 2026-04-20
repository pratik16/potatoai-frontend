import { Link } from 'react-router-dom';
import { useGetAdminPricingQuery } from '../adminApi';
import { PageHeader, AdminTable, Skeleton, formatDate } from '../components/AdminShared';

export default function AdminPricingPage() {
  const { data: models, isLoading } = useGetAdminPricingQuery();

  return (
    <div>
      <PageHeader title="Pricing" />
      <AdminTable
        headers={['Model', 'Input $/1M', 'Output $/1M', 'Margin %', 'Credits/1K in', 'Credits/1K out', 'Effective From', 'Actions']}
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
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.provider_input_price_per_1m ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.provider_output_price_per_1m ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.margin_percent ?? '—'}%</td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.credit_per_input_1k?.toFixed(4) ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">{m.active_pricing?.credit_per_output_1k?.toFixed(4) ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-400">{formatDate(m.active_pricing?.effective_from)}</td>
              <td className="px-4 py-3 flex gap-3">
                <Link to={`/admin/pricing/${m.id}/edit`} className="text-xs text-purple-400 hover:text-purple-300">
                  Edit
                </Link>
                <Link to={`/admin/pricing/${m.id}/history`} className="text-xs text-gray-400 hover:text-white">
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
