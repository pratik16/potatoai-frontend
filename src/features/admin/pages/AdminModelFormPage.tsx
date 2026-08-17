import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  useCreateModelMutation, useSavePricingMutation, useToggleModelMutation, useGetCreditsConfigQuery,
} from '../adminApi';
import { PageHeader } from '../components/AdminShared';
import { LivePricingPreview, ImagePricingPreview } from '../components/LivePricingPreview';
import { apiErrorMessage, apiFieldErrors } from '../../../utils/apiError';
import type {
  NewModelData, NewPricingData, ModelType, ImageCapability,
} from '../../../types/admin.types';

const ROUTERS   = ['openrouter', 'direct'];
const PROVIDERS = ['anthropic', 'openai', 'google', 'alibaba', 'minimax'];

const TYPES: { value: ModelType; label: string; hint: string }[] = [
  { value: 'text',  label: 'Text',  hint: 'Chat model. Rated per 1K tokens and offered in the model picker.' },
  { value: 'image', label: 'Image', hint: 'Image model. Rated at a flat price per image and never offered in chat.' },
];

const CAPABILITIES: { value: ImageCapability; label: string }[] = [
  { value: 'generate', label: 'generate — text prompt in, new image out' },
  { value: 'edit',     label: 'edit — existing image in, modified image out' },
];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE  = /^#[0-9a-fA-F]{6}$/;

/**
 * A model only becomes usable once BOTH the row and a pricing row exist, and
 * those are two separate endpoints. Rather than invent a combined endpoint we
 * order the writes so no intermediate state can hurt a user:
 *
 *   1. create the model FORCED INACTIVE (never visible to users, whatever the
 *      admin picked)
 *   2. POST its first pricing row
 *   3. only then flip is_active on, if that is what the admin asked for
 *
 * A failure at step 2 therefore leaves an inactive, unpriced model — invisible
 * and harmless — instead of an active unpriced one, which after Phase 1 answers
 * users with 403 MODEL_PRICING_MISSING. The half-created state is still shown
 * loudly, and re-submitting resumes from the failed step rather than creating a
 * second row.
 */
type Stage = 'idle' | 'creating' | 'pricing' | 'activating';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function AdminModelFormPage() {
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useGetCreditsConfigQuery();

  const [createModel] = useCreateModelMutation();
  const [savePricing] = useSavePricingMutation();
  const [toggleModel] = useToggleModelMutation();

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  // Per-field copy from a 422 VALIDATION_ERROR — the most likely create failure
  // is a duplicate slug, which is far clearer pinned to the field than in a banner.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Progress markers. Once set they gate the resume path, so a retry never
  // re-runs a step that already succeeded.
  const [createdId,   setCreatedId]   = useState<number | null>(null);
  const [pricingDone, setPricingDone] = useState(false);

  const [model, setModel] = useState<NewModelData>({
    name:              '',
    slug:              '',
    provider:          PROVIDERS[0],
    router:            ROUTERS[0],
    router_model_id:   '',
    colour_hex:        '#8b5cf6',
    description:       '',
    is_active:         true,
    is_pro_only:       false,
    supports_vision:   false,
    supports_thinking: false,
    context_window:    null,
    sort_order:        99,
    type:              'text',
    image_capability:  null,
  });

  // Both rating schemes live in one state object and only the half that matches
  // the selected type is ever submitted — so flipping the type back and forth
  // never loses what the admin already typed on the other side.
  const [pricing, setPricing] = useState({
    provider_input_price_per_1m:  0,
    provider_output_price_per_1m: 0,
    margin_percent:               30,
    credit_per_image:             0,
    effective_from:               new Date().toISOString().slice(0, 16),
    notes:                        '',
  });

  const isImage     = model.type === 'image';
  const previewForm = useMemo(() => ({ ...pricing }), [pricing]);

  /**
   * Type drives the whole shape of the record, so switching it also clears the
   * fields that stop being meaningful — an image model has no context window
   * and cannot think, and a text model must carry a null capability (the column
   * is only populated for image rows).
   */
  const setType = (type: ModelType) => setModel((m) => ({
    ...m,
    type,
    image_capability:  type === 'image' ? (m.image_capability ?? 'generate') : null,
    supports_thinking: type === 'image' ? false : m.supports_thinking,
    context_window:    type === 'image' ? null  : m.context_window,
  }));

  // Identity fields are frozen after step 1 — the row already exists and a
  // retry deliberately skips the create, so edits here would silently not apply.
  const locked  = createdId !== null;
  const busy    = stage !== 'idle';
  const partial = createdId !== null && !pricingDone;

  const validate = (): string => {
    if (!model.name.trim())                  return 'Name is required.';
    if (!SLUG_RE.test(model.slug))           return 'Slug must be lowercase words separated by single hyphens, e.g. "claude-sonnet-4-5".';
    if (!model.router_model_id.trim())       return 'Router model ID is required — it is the id the router knows (e.g. "anthropic/claude-sonnet-4.5"), not the slug.';
    if (!HEX_RE.test(model.colour_hex))      return 'Colour must be a 6-digit hex value, e.g. #8b5cf6.';

    // Only the rating scheme that will actually be submitted is validated — the
    // other half of the pricing state is never sent, so stale values there are
    // not an error.
    if (isImage) {
      if (!model.image_capability) return 'Pick what the image model does — generate or edit.';
      // 0 would publish a model that costs nothing, i.e. unlimited free images.
      if (!(pricing.credit_per_image > 0)) return 'Credits per image must be greater than 0.';
      return '';
    }

    // Mirrors AdminPricingController (margin max:99); at 100 the multiplier is infinite.
    if (pricing.margin_percent < 0 || pricing.margin_percent > 99) return 'Margin must be between 0 and 99%.';
    if (pricing.provider_input_price_per_1m < 0 || pricing.provider_output_price_per_1m < 0) {
      return 'Provider prices cannot be negative.';
    }
    return '';
  };

  /**
   * A pricing row rates tokens or images, never both. Send the unused side as
   * an explicit null rather than omitting it, so the row that lands can only be
   * one of the two valid shapes.
   */
  const pricingPayload = (): NewPricingData => {
    const shared = {
      effective_from: new Date(pricing.effective_from).toISOString(),
      notes:          pricing.notes,
    };
    return isImage
      ? {
        ...shared,
        provider_input_price_per_1m:  null,
        provider_output_price_per_1m: null,
        margin_percent:               null,
        credit_per_image:             pricing.credit_per_image,
      }
      : {
        ...shared,
        provider_input_price_per_1m:  pricing.provider_input_price_per_1m,
        provider_output_price_per_1m: pricing.provider_output_price_per_1m,
        margin_percent:               pricing.margin_percent,
        credit_per_image:             null,
      };
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    const invalid = validate();
    if (invalid) { setError(invalid); return; }

    let modelId = createdId;

    // Step 1 — create, always inactive.
    if (modelId === null) {
      setStage('creating');
      try {
        const created = await createModel({
          ...model,
          description:      model.description?.trim() ? model.description.trim() : null,
          // Guaranteed null on a text model even if the admin toggled the type
          // back and forth after picking a capability.
          image_capability: isImage ? model.image_capability : null,
          is_active:        false,
        }).unwrap();
        modelId = created.id;
        setCreatedId(created.id);
      } catch (e) {
        setStage('idle');
        setFieldErrors(apiFieldErrors(e));
        setError(apiErrorMessage(e, 'Failed to create the model. Nothing was saved — check the fields and try again.'));
        return;
      }
    }

    // Step 2 — first pricing row.
    if (!pricingDone) {
      setStage('pricing');
      try {
        await savePricing({ modelId, data: pricingPayload() }).unwrap();
        setPricingDone(true);
      } catch (e) {
        setStage('idle');
        setFieldErrors(apiFieldErrors(e));
        setError(apiErrorMessage(e, 'Failed to save pricing. Fix the numbers below and press Retry Pricing.'));
        return;
      }
    }

    // Step 3 — activate, if requested.
    if (model.is_active) {
      setStage('activating');
      try {
        await toggleModel({ id: modelId, patch: { is_active: true } }).unwrap();
      } catch (e) {
        setStage('idle');
        setError(
          `${apiErrorMessage(e, 'Failed to activate the model.')} The model and its pricing were saved — ` +
          'switch Active on from the models list to finish.',
        );
        return;
      }
    }

    setStage('idle');
    navigate('/admin/models');
  };

  const text = (
    label: string,
    key: 'name' | 'slug' | 'router_model_id' | 'colour_hex' | 'description',
    placeholder = '',
    hint?: string,
  ) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-gray-400" htmlFor={`model-${key}`}>{label}</label>
      <input
        id={`model-${key}`}
        value={model[key] ?? ''}
        placeholder={placeholder}
        disabled={locked}
        onChange={(e) => setModel((m) => ({ ...m, [key]: e.target.value }))}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
      />
      <FieldError message={fieldErrors[key]} />
      {hint && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </div>
  );

  const select = (label: string, key: 'provider' | 'router', options: string[]) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-gray-400" htmlFor={`model-${key}`}>{label}</label>
      <select
        id={`model-${key}`}
        value={model[key]}
        disabled={locked}
        onChange={(e) => setModel((m) => ({ ...m, [key]: e.target.value }))}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <FieldError message={fieldErrors[key]} />
    </div>
  );

  const check = (
    label: string,
    key: 'is_active' | 'is_pro_only' | 'supports_vision' | 'supports_thinking',
    hint?: string,
  ) => (
    <label className="mb-2 flex items-start gap-2 text-sm text-gray-300" htmlFor={`model-${key}`}>
      <input
        id={`model-${key}`}
        type="checkbox"
        checked={model[key]}
        disabled={locked && key !== 'is_active'}
        onChange={(e) => setModel((m) => ({ ...m, [key]: e.target.checked }))}
        className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-gray-900 disabled:opacity-50"
      />
      <span>
        {label}
        {hint && <span className="block text-xs text-gray-600">{hint}</span>}
      </span>
    </label>
  );

  const priceField = (label: string, key: keyof typeof pricing, type = 'number', step = '0.000001') => (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-gray-400" htmlFor={`price-${String(key)}`}>{label}</label>
      <input
        id={`price-${String(key)}`}
        type={type}
        step={step}
        value={pricing[key]}
        onChange={(e) => setPricing((f) => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
      />
      <FieldError message={fieldErrors[String(key)]} />
    </div>
  );

  // The preview divides by usd_per_credit; rendering before it loads shows
  // fabricated numbers (same reason AdminPricingEditPage gates on it).
  if (configLoading || !config) {
    return (
      <div>
        <PageHeader title="Add Model" backTo="/admin/models" />
        <p className="text-sm text-gray-500">Loading credits config…</p>
      </div>
    );
  }

  // A resumed submit skips whatever already succeeded, so the label has to name
  // the step that will actually run — "Create Model" on a retry would be a lie.
  const buttonLabel =
    stage === 'creating'          ? 'Creating model…'
    : stage === 'pricing'           ? 'Saving pricing…'
    : stage === 'activating'        ? 'Activating…'
    : partial                       ? 'Retry Pricing'
    : createdId !== null            ? 'Retry Activation'
    : 'Create Model';

  return (
    <div>
      <PageHeader title="Add Model" backTo="/admin/models" />

      {partial && (
        <div className="mb-6 rounded-lg border border-amber-700 bg-amber-950/40 p-4">
          <p className="text-sm font-semibold text-amber-300">
            Half-created: “{model.name}” exists (id {createdId}) but has no pricing yet.
          </p>
          <p className="mt-1 text-xs text-amber-200/80">
            It was created <span className="font-semibold">inactive</span>, so no user can select it and no one is
            being charged against it. Nothing else is needed to keep users safe — but the model is unusable until
            you save a pricing row. Fix the pricing fields and press <span className="font-semibold">Retry Pricing</span>;
            the model itself will not be created a second time. To abandon it instead, leave this page and remove
            the model from the models list.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Model</p>

          <div className="mb-4">
            <span id="model-type-label" className="mb-1 block text-sm text-gray-400">Type</span>
            <div role="radiogroup" aria-labelledby="model-type-label" className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={model.type === t.value}
                  disabled={locked}
                  onClick={() => setType(t.value)}
                  className={clsx(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                    model.type === t.value
                      ? 'border-purple-500 bg-purple-950/50 text-white'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-800',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-600">{TYPES.find((t) => t.value === model.type)?.hint}</p>
            <FieldError message={fieldErrors.type} />
          </div>

          {isImage && (
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400" htmlFor="model-image_capability">
                Image capability
              </label>
              <select
                id="model-image_capability"
                value={model.image_capability ?? 'generate'}
                disabled={locked}
                onChange={(e) => setModel((m) => ({ ...m, image_capability: e.target.value as ImageCapability }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
              >
                {CAPABILITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <FieldError message={fieldErrors.image_capability} />
            </div>
          )}

          {text('Name', 'name', 'Claude Sonnet 4.5')}
          {text(
            'Slug', 'slug', isImage ? 'flux-1-pro' : 'claude-sonnet-4-5',
            isImage
              ? 'Our identifier. Used by the image endpoints — never shown in the chat model picker.'
              : 'Our identifier. Used by the chat client to pick the model.',
          )}
          {select('Provider', 'provider', PROVIDERS)}
          {select('Router', 'router', ROUTERS)}
          {text(
            'Router Model ID', 'router_model_id', 'anthropic/claude-sonnet-4.5',
            'The id the router knows — usually different from the slug.',
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400" htmlFor="model-colour_hex">Colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick model colour"
                value={HEX_RE.test(model.colour_hex) ? model.colour_hex : '#8b5cf6'}
                disabled={locked}
                onChange={(e) => setModel((m) => ({ ...m, colour_hex: e.target.value }))}
                className="h-9 w-12 shrink-0 rounded border border-gray-700 bg-gray-900 disabled:opacity-50"
              />
              <input
                id="model-colour_hex"
                value={model.colour_hex}
                disabled={locked}
                onChange={(e) => setModel((m) => ({ ...m, colour_hex: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <FieldError message={fieldErrors.colour_hex} />
          </div>

          {text(
            'Description (optional)', 'description', isImage ? '1024×1024, photoreal' : 'Fast, strong at code',
            isImage
              ? 'Shown wherever the image model is offered.'
              : 'Shown under the model name in the chat model picker.',
          )}

          <div className={clsx('mb-4 grid gap-4', isImage ? 'grid-cols-1' : 'grid-cols-2')}>
            {/* An image model has no token context, so the column stays null. */}
            {!isImage && (
              <div>
                <label className="mb-1 block text-sm text-gray-400" htmlFor="model-context_window">Context Window</label>
                <input
                  id="model-context_window"
                  type="number"
                  value={model.context_window ?? ''}
                  placeholder="200000"
                  disabled={locked}
                  onChange={(e) => setModel((m) => ({
                    ...m, context_window: e.target.value === '' ? null : +e.target.value,
                  }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
                <FieldError message={fieldErrors.context_window} />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-gray-400" htmlFor="model-sort_order">Sort Order</label>
              <input
                id="model-sort_order"
                type="number"
                value={model.sort_order}
                disabled={locked}
                onChange={(e) => setModel((m) => ({ ...m, sort_order: +e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
              <FieldError message={fieldErrors.sort_order} />
            </div>
          </div>

          <div className="mb-6">
            {check('Active', 'is_active', 'Applied only after pricing saves — never before.')}
            {check('Pro only', 'is_pro_only')}
            {check(
              'Supports vision',
              'supports_vision',
              isImage ? 'Tick for an edit model — it takes an existing image as input.' : undefined,
            )}
            {/* Thinking is a token-model trait; an image row must not claim it. */}
            {!isImage && check('Supports thinking', 'supports_thinking')}
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Initial Pricing</p>
          {isImage ? (
            <>
              {priceField('Credits per Image', 'credit_per_image', 'number', '0.0001')}
              <p className="mb-4 -mt-2 text-xs text-gray-600">
                Charged in full for every generated image. Image models are not rated per token, so the
                provider price and margin fields do not apply — those columns stay empty on the pricing row.
              </p>
            </>
          ) : (
            <>
              {priceField('Provider Input Price ($/1M tokens)', 'provider_input_price_per_1m')}
              {priceField('Provider Output Price ($/1M tokens)', 'provider_output_price_per_1m')}
              {priceField('Margin %', 'margin_percent', 'number', '0.01')}
            </>
          )}
          {priceField('Effective From', 'effective_from', 'datetime-local', '')}

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400" htmlFor="price-notes">Notes (optional)</label>
            <textarea
              id="price-notes"
              value={pricing.notes}
              onChange={(e) => setPricing((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {error && <p role="alert" className="mb-3 text-sm text-red-400">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {buttonLabel}
            </button>
            <button
              onClick={() => navigate('/admin/models')}
              disabled={busy}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Creates the model inactive, saves its first pricing row, then activates it if Active is ticked.
          </p>
        </div>

        {isImage
          ? <ImagePricingPreview creditPerImage={previewForm.credit_per_image} config={config} />
          : <LivePricingPreview form={previewForm} config={config} />}
      </div>
    </div>
  );
}
