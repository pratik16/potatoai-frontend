import type { CreditsConfig, NewPricingData } from '../../../types/admin.types';

interface PreviewData {
  marginMultiplier:    number;
  creditPerInput1k:    number;
  creditPerOutput1k:   number;
  freeUserMaxInput:    number;
  freeUserMaxOutput:   number;
  freeUserApproxMsgs: number;
  grossProfitPer100:  number;
}

export function calculatePreview(form: Pick<NewPricingData, 'provider_input_price_per_1m' | 'provider_output_price_per_1m' | 'margin_percent'>, config: CreditsConfig): PreviewData {
  const marginMul     = 1 / (1 - form.margin_percent / 100);
  const creditIn1k    = (form.provider_input_price_per_1m  / 1000) * marginMul / config.usd_per_credit;
  const creditOut1k   = (form.provider_output_price_per_1m / 1000) * marginMul / config.usd_per_credit;
  const free          = config.free_plan_monthly_credits;
  const maxInput      = creditIn1k  > 0 ? (free / creditIn1k)  * 1000 : Infinity;
  const maxOutput     = creditOut1k > 0 ? (free / creditOut1k) * 1000 : Infinity;
  const avgCostPerMsg = (creditIn1k * 0.5) + (creditOut1k * 0.5);
  const approxMsgs    = avgCostPerMsg > 0 ? Math.floor(free / avgCostPerMsg) : Infinity;
  const grossProfit   = 100 * (form.margin_percent / 100) * marginMul;

  return {
    marginMultiplier:    marginMul,
    creditPerInput1k:    creditIn1k,
    creditPerOutput1k:   creditOut1k,
    freeUserMaxInput:    maxInput,
    freeUserMaxOutput:   maxOutput,
    freeUserApproxMsgs: approxMsgs,
    grossProfitPer100:  grossProfit,
  };
}

export function LivePricingPreview({
  form, config,
}: {
  form:   Pick<NewPricingData, 'provider_input_price_per_1m' | 'provider_output_price_per_1m' | 'margin_percent'>;
  config: CreditsConfig;
}) {
  const p = calculatePreview(form, config);
  const fmt = (n: number) => isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '∞';

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-5 font-mono text-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Live Calculation Preview</p>

      <Row label="USD per credit" value={`$${config.usd_per_credit}`} />
      <Row label="Margin multiplier" value={`${p.marginMultiplier.toFixed(4)}  (${form.margin_percent}% margin)`} />

      <Divider />
      <Row label="Credits / 1K input"  value={`${p.creditPerInput1k.toFixed(4)} credits`}  color="text-blue-400" />
      <Row label="Credits / 1K output" value={`${p.creditPerOutput1k.toFixed(4)} credits`} color="text-blue-400" />

      <Divider label={`Free user (${config.free_plan_monthly_credits} credits)`} />
      <Row label="Max input tokens"  value={`≈ ${fmt(p.freeUserMaxInput)}`} />
      <Row label="Max output tokens" value={`≈ ${fmt(p.freeUserMaxOutput)}`} />
      <Row label="Typical messages"  value={`≈ ${fmt(p.freeUserApproxMsgs)} exchanges`} />

      <Divider label="Per $100 provider spend" />
      <Row label="Gross profit" value={`≈ $${p.grossProfitPer100.toFixed(2)}`} color="text-green-400" />
    </div>
  );
}

function Row({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="my-3 border-t border-gray-700">
      {label && <p className="mt-2 text-xs text-gray-500">── {label} ──</p>}
    </div>
  );
}
