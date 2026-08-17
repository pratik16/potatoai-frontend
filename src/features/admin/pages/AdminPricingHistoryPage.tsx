import { useParams } from 'react-router-dom';
import { useGetPricingHistoryQuery } from '../adminApi';
import { PageHeader, AdminTable, Skeleton, formatDateTime, formatPricingCost } from '../components/AdminShared';

export default function AdminPricingHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetPricingHistoryQuery(Number(id));

  return (
    <div>
      <PageHeader
        title={`Pricing History — ${data?.model.name ?? '…'}`}
        backTo="/admin/pricing"
      />
      <AdminTable
        headers={['Effective From', 'Input $/1M', 'Output $/1M', 'Margin %', 'Cost (credits)', 'Notes', 'Created by IP']}
        empty={!isLoading && !data?.pricing_history.length}
      >
        {isLoading ? (
          <Skeleton rows={5} cols={7} />
        ) : (
          data?.pricing_history.map((row) => (
            <tr key={row.id} className="hover:bg-gray-900/50">
              <td className="px-4 py-3 text-xs text-gray-300">{formatDateTime(row.effective_from)}</td>
              {/* Null on an image model's row — it is priced per image, not per token. */}
              <td className="px-4 py-3 text-gray-300">{row.provider_input_price_per_1m ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">{row.provider_output_price_per_1m ?? '—'}</td>
              <td className="px-4 py-3 text-gray-300">
                {row.margin_percent == null ? '—' : `${row.margin_percent}%`}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-300">{formatPricingCost(row)}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{row.notes ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{row.created_by_ip}</td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
