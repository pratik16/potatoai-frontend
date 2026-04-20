import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAdminModelsQuery, useSavePricingMutation, useGetCreditsConfigQuery } from '../adminApi';
import { PageHeader } from '../components/AdminShared';
import { LivePricingPreview } from '../components/LivePricingPreview';

export default function AdminPricingEditPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { data: models }  = useGetAdminModelsQuery();
  const { data: config }  = useGetCreditsConfigQuery();
  const [save, { isLoading }] = useSavePricingMutation();
  const model = models?.find((m) => m.id === Number(id));

  const [form, setForm] = useState({
    provider_input_price_per_1m:  model?.active_pricing?.provider_input_price_per_1m  ?? 0,
    provider_output_price_per_1m: model?.active_pricing?.provider_output_price_per_1m ?? 0,
    margin_percent:               model?.active_pricing?.margin_percent ?? 30,
    effective_from:               new Date().toISOString().slice(0, 16),
    notes:                        '',
  });
  const [error, setError] = useState('');

  const previewConfig = config ?? {
    id: 0, usd_per_credit: 0.001, reserve_percent: 10,
    free_plan_monthly_credits: 50, pro_plan_monthly_credits: 1000, team_plan_monthly_credits: 5000,
  };

  const previewForm = useMemo(() => ({ ...form }), [form]);

  const handleSave = async () => {
    setError('');
    try {
      await save({ modelId: Number(id), data: { ...form, effective_from: new Date(form.effective_from).toISOString() } }).unwrap();
      navigate('/admin/pricing');
    } catch {
      setError('Failed to save pricing. Check the values and try again.');
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'number', step = '0.000001') => (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-gray-400">{label}</label>
      <input
        type={type}
        step={step}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
      />
    </div>
  );

  return (
    <div>
      <PageHeader title={`Edit Pricing — ${model?.name ?? '...'}`} backTo="/admin/pricing" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          {field('Provider Input Price ($/1M tokens)', 'provider_input_price_per_1m')}
          {field('Provider Output Price ($/1M tokens)', 'provider_output_price_per_1m')}
          {field('Margin %', 'margin_percent', 'number', '0.01')}
          {field('Effective From', 'effective_from', 'datetime-local', '')}

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving…' : 'Save New Pricing Row'}
          </button>
          <p className="mt-2 text-xs text-gray-600">
            Inserts a new row — previous pricing is preserved as history.
          </p>
        </div>

        <LivePricingPreview form={previewForm} config={previewConfig} />
      </div>
    </div>
  );
}
