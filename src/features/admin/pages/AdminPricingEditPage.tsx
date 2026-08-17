import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAdminModelsQuery, useSavePricingMutation, useGetCreditsConfigQuery } from '../adminApi';
import { PageHeader, num } from '../components/AdminShared';
import { LivePricingPreview, ImagePricingPreview } from '../components/LivePricingPreview';
import type { NewPricingData } from '../../../types/admin.types';

export default function AdminPricingEditPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  // `{}` = live models only. A model being priced here is never an archived one.
  const { data: models, isLoading: modelsLoading } = useGetAdminModelsQuery({});
  const { data: config, isLoading: configLoading } = useGetCreditsConfigQuery();
  const [save, { isLoading }] = useSavePricingMutation();
  const model = models?.find((m) => m.id === Number(id));

  const [form, setForm] = useState({
    provider_input_price_per_1m:  0,
    provider_output_price_per_1m: 0,
    margin_percent:               30,
    credit_per_image:             0,
    effective_from:               new Date().toISOString().slice(0, 16),
    notes:                        '',
  });
  const [error, setError] = useState('');

  /**
   * Which rating scheme this model uses. Read from the model's `type` when the
   * API supplies it, and fall back to the shape of the existing pricing row —
   * that keeps the page correct against an API that predates the text/image
   * split, and it matters here more than anywhere: posting the token form for
   * an image model would append a row that prices images at nothing.
   */
  const isImage = model?.type === 'image' || model?.active_pricing?.credit_per_image != null;

  // On a direct load of /admin/pricing/:id/edit the models query is still in
  // flight during first render, so seeding useState alone left the form on
  // 0 / 0 / 30% — and saving that writes a zero-cost row into an append-only
  // table that the UI cannot undo. Resync once the model arrives.
  const activePricing = model?.active_pricing;
  useEffect(() => {
    if (!activePricing) return;
    setForm((prev) => ({
      ...prev,
      // Whichever half is NULL on the row seeds as 0 and is never submitted for
      // that kind of model, so a null token rate cannot leak into an image row.
      provider_input_price_per_1m:  num(activePricing.provider_input_price_per_1m),
      provider_output_price_per_1m: num(activePricing.provider_output_price_per_1m),
      margin_percent:               num(activePricing.margin_percent),
      credit_per_image:             num(activePricing.credit_per_image),
    }));
  }, [activePricing]);

  const previewForm = useMemo(() => ({ ...form }), [form]);

  // A pricing row rates tokens or images, never both — send the unused side as
  // an explicit null so the appended row can only be one of the two valid shapes.
  const payload = (): NewPricingData => {
    const shared = { effective_from: new Date(form.effective_from).toISOString(), notes: form.notes };
    return isImage
      ? {
        ...shared,
        provider_input_price_per_1m:  null,
        provider_output_price_per_1m: null,
        margin_percent:               null,
        credit_per_image:             form.credit_per_image,
      }
      : {
        ...shared,
        provider_input_price_per_1m:  form.provider_input_price_per_1m,
        provider_output_price_per_1m: form.provider_output_price_per_1m,
        margin_percent:               form.margin_percent,
        credit_per_image:             null,
      };
  };

  const handleSave = async () => {
    setError('');
    if (isImage) {
      // 0 would append a row that makes every image free — and this table is
      // append-only, so it cannot be taken back, only superseded.
      if (!(form.credit_per_image > 0)) {
        setError('Credits per image must be greater than 0.');
        return;
      }
    } else if (form.margin_percent < 0 || form.margin_percent > 99) {
      // Mirrors the server-side rule (AdminPricingController: margin max:99);
      // at 100 the margin multiplier is infinite.
      setError('Margin must be between 0 and 99%.');
      return;
    }
    try {
      await save({ modelId: Number(id), data: payload() }).unwrap();
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

  // The preview divides by usd_per_credit and the form seeds from active_pricing;
  // rendering either before they load showed fabricated numbers.
  if (modelsLoading || configLoading || !config) {
    return (
      <div>
        <PageHeader title="Edit Pricing" backTo="/admin/pricing" />
        <p className="text-sm text-gray-500">Loading model and credits config…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit Pricing — ${model?.name ?? '...'}`} backTo="/admin/pricing" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          {isImage ? (
            <>
              {field('Credits per Image', 'credit_per_image', 'number', '0.0001')}
              <p className="mb-4 -mt-2 text-xs text-gray-600">
                This model is rated per image, so it has no provider token price or margin — those
                columns stay empty on the new row.
              </p>
            </>
          ) : (
            <>
              {field('Provider Input Price ($/1M tokens)', 'provider_input_price_per_1m')}
              {field('Provider Output Price ($/1M tokens)', 'provider_output_price_per_1m')}
              {field('Margin %', 'margin_percent', 'number', '0.01')}
            </>
          )}
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

        {isImage
          ? <ImagePricingPreview creditPerImage={previewForm.credit_per_image} config={config} />
          : <LivePricingPreview form={previewForm} config={config} />}
      </div>
    </div>
  );
}
