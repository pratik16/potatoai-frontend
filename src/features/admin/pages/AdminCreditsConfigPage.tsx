import { useState, useEffect } from 'react';
import { useGetCreditsConfigQuery, useUpdateCreditsConfigMutation } from '../adminApi';
import { PageHeader } from '../components/AdminShared';
import type { CreditsConfig } from '../../../types/admin.types';

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-1 block text-sm font-medium text-gray-300">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-600">{hint}</p>}
      {children}
    </div>
  );
}

export default function AdminCreditsConfigPage() {
  const { data: config, isLoading } = useGetCreditsConfigQuery();
  const [update, { isLoading: isSaving }] = useUpdateCreditsConfigMutation();
  const [form, setForm] = useState<Partial<CreditsConfig>>({});
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const handleSave = async () => {
    setError(''); setSaved(false);
    try {
      await update(form as CreditsConfig).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update config.');
    }
  };

  const numField = (key: keyof CreditsConfig, step = '0.000001') => (
    <input
      type="number"
      step={step}
      value={form[key] ?? ''}
      onChange={(e) => setForm((f) => ({ ...f, [key]: +e.target.value }))}
      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
    />
  );

  return (
    <div>
      <PageHeader title="Credits Config" />

      <div className="max-w-lg">
        <div className="mb-6 rounded-lg border border-amber-700 bg-amber-900/20 p-4 text-sm text-amber-300">
          ⚠️ Changing USD per credit affects all future calculations but does NOT retroactively change existing balances.
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-900" />
            ))}
          </div>
        ) : (
          <>
            <FormRow label="USD per credit ($)" hint="Exchange rate — $0.001 = 1000 credits per $1">
              {numField('usd_per_credit')}
            </FormRow>
            <FormRow label="Reserve %" hint="Buffer kept from provider spend">
              {numField('reserve_percent', '0.01')}
            </FormRow>
            <FormRow label="Free plan credits / month">
              {numField('free_plan_monthly_credits', '1')}
            </FormRow>
            <FormRow label="Pro plan credits / month">
              {numField('pro_plan_monthly_credits', '1')}
            </FormRow>
            <FormRow label="Team plan credits / month">
              {numField('team_plan_monthly_credits', '1')}
            </FormRow>

            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
            {saved && <p className="mb-3 text-sm text-green-400">✓ Config saved successfully</p>}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save Config'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
