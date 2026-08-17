import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useGetAdminModelsQuery, useToggleModelMutation, useDeleteModelMutation } from '../adminApi';
import { PageHeader, Toggle, AdminTable, Skeleton, formatDate, formatPricingCost } from '../components/AdminShared';
import { apiErrorMessage } from '../../../utils/apiError';
import type { AdminModel, ModelRemovalResult } from '../../../types/admin.types';

type Outcome =
  | { kind: 'removed'; name: string; result: ModelRemovalResult }
  | { kind: 'error';   name: string; message: string };

export default function AdminModelsPage() {
  const [showRemoved, setShowRemoved] = useState(false);
  const { data: models, isLoading } = useGetAdminModelsQuery({ with_removed: showRemoved });
  const [toggleModel] = useToggleModelMutation();
  const [deleteModel, { isLoading: isRemoving }] = useDeleteModelMutation();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const handle = (model: AdminModel, field: 'is_active' | 'is_pro_only', val: boolean) => {
    toggleModel({ id: model.id, patch: { [field]: val } });
  };

  const handleRemove = async (model: AdminModel) => {
    const ok = window.confirm(
      `Remove "${model.name}"?\n\n` +
      'If it has never been priced or used, the row is deleted permanently. ' +
      'If billing history references it, it is deactivated and archived instead so past ' +
      'invoices keep resolving. Either way users can no longer select it.',
    );
    if (!ok) return;

    setOutcome(null);
    try {
      const result = await deleteModel(model.id).unwrap();
      setOutcome({ kind: 'removed', name: model.name, result });
    } catch (e) {
      setOutcome({
        kind:    'error',
        name:    model.name,
        message: apiErrorMessage(e, 'Failed to remove the model.'),
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Models"
        action={
          <Link
            to="/admin/models/new"
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
          >
            + Add Model
          </Link>
        }
      />

      {outcome && <OutcomeBanner outcome={outcome} onDismiss={() => setOutcome(null)} />}

      <label className="mb-3 flex w-fit items-center gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={showRemoved}
          onChange={(e) => setShowRemoved(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-700 bg-gray-900"
        />
        Show archived models
      </label>

      <AdminTable
        headers={['Model', 'Type', 'Provider', 'Active', 'Pro Only', 'Cost (credits)', 'Effective From', 'Actions']}
        empty={!isLoading && !models?.length}
      >
        {isLoading ? (
          <Skeleton rows={5} cols={8} />
        ) : (
          models?.map((m) => {
            // `deleted_at` is absent entirely unless with_removed=1 was sent, so
            // test truthiness rather than comparing against null.
            const archived = Boolean(m.deleted_at);
            return (
              <tr key={m.id} className={clsx(archived ? 'bg-gray-900/30 opacity-60' : 'hover:bg-gray-900/50')}>
                <td className="px-4 py-3 font-medium text-white">
                  <span style={{ color: m.colour_hex }}>●</span> {m.name}
                  {archived && (
                    <span
                      className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-xs font-normal text-gray-300"
                      title={`Archived ${formatDate(m.deleted_at)} — kept because billing history references it`}
                    >
                      Archived
                    </span>
                  )}
                </td>
                <td className="px-4 py-3"><TypeBadge model={m} /></td>
                <td className="px-4 py-3 text-gray-400">{m.provider}</td>
                <td className="px-4 py-3">
                  <Toggle checked={m.is_active} disabled={archived} onChange={(v) => handle(m, 'is_active', v)} />
                </td>
                <td className="px-4 py-3">
                  <Toggle checked={m.is_pro_only} disabled={archived} onChange={(v) => handle(m, 'is_pro_only', v)} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300">
                  {formatPricingCost(m.active_pricing)}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(m.active_pricing?.effective_from)}</td>
                <td className="px-4 py-3">
                  {archived ? (
                    <span className="text-xs text-gray-600">—</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/pricing/${m.id}/edit`} className="text-xs text-purple-400 hover:text-purple-300">
                        Edit Pricing
                      </Link>
                      <Link to={`/admin/pricing/${m.id}/history`} className="text-xs text-gray-400 hover:text-white">
                        History
                      </Link>
                      <button
                        onClick={() => handleRemove(m)}
                        disabled={isRemoving}
                        className="text-xs text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </AdminTable>
    </div>
  );
}

/**
 * Image models are priced and routed differently from chat models and never
 * appear in the chat picker, so the kind has to be legible at a glance in the
 * catalogue. `type` is absent on responses from an API that predates the split;
 * everything that existed then was text, so that reads as text.
 */
function TypeBadge({ model }: { model: AdminModel }) {
  const isImage = model.type === 'image';
  return (
    <span
      className={clsx(
        'rounded px-1.5 py-0.5 text-xs font-medium',
        isImage ? 'bg-blue-950 text-blue-300' : 'bg-gray-800 text-gray-300',
      )}
      title={isImage && model.image_capability ? `Image model (${model.image_capability})` : undefined}
    >
      {isImage ? `image${model.image_capability ? ` · ${model.image_capability}` : ''}` : 'text'}
    </span>
  );
}

/**
 * Deleting a model resolves two very different ways and the admin has to be able
 * to tell them apart — "gone" vs "still on every past invoice". Branch on the
 * machine-readable `action`; the server `message` is display-only detail.
 */
function OutcomeBanner({ outcome, onDismiss }: { outcome: Outcome; onDismiss: () => void }) {
  const tone =
    outcome.kind === 'error'                   ? 'border-red-800 bg-red-950/40 text-red-300'
    : outcome.result.action === 'hard_deleted' ? 'border-green-800 bg-green-950/40 text-green-300'
    : 'border-amber-700 bg-amber-950/40 text-amber-300';

  const heading =
    outcome.kind === 'error'                   ? `Could not remove “${outcome.name}”`
    : outcome.result.action === 'hard_deleted' ? `Deleted “${outcome.name}” permanently`
    : outcome.result.action === 'soft_deleted' ? `Archived “${outcome.name}” — not deleted`
    : `Removed “${outcome.name}”`;

  const detail =
    outcome.kind === 'error'                   ? outcome.message
    : outcome.result.action === 'hard_deleted' ? 'It had no pricing and no usage history, so the row was dropped.'
    : outcome.result.action === 'soft_deleted' ? 'Billing history references it, so it was deactivated and kept. Users can no longer select it; past invoices still resolve. Tick "Show archived models" to see it.'
    : 'The server did not report how the model was removed. Re-check the list before assuming it is gone.';

  return (
    <div className={`mb-4 flex items-start justify-between gap-4 rounded-lg border p-4 ${tone}`} role="status">
      <div>
        <p className="text-sm font-semibold">{heading}</p>
        <p className="mt-1 text-xs opacity-80">{detail}</p>
        {outcome.kind === 'removed' && outcome.result.message && (
          <p className="mt-1 text-xs opacity-70">Server: {outcome.result.message}</p>
        )}
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-xs opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
