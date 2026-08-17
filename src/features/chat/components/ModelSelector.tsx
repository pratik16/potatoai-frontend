import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Spinner } from '../../../components/ui/Spinner';
import { setModel } from '../chatSlice';
import { useGetModelsQuery } from '../chatApi';
import { isTextModel } from '../../../utils/modelConfig';

const FALLBACK_COLOUR = '#8b5cf6';

export function ModelSelector() {
  const dispatch      = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);
  const [open, setOpen] = useState(false);

  // `GET /api/models` already filters on is_active, so this list is what admin
  // has switched on — but since the image catalogue it also carries image models,
  // which the chat stream cannot drive and which are billed per image. Keep only
  // the text ones.
  //
  // `isTextModel` treats a MISSING `type` as text on purpose: the API change that
  // adds the field deploys separately from this bundle, and a filter that
  // required it would leave every user with an empty picker for the length of
  // that skew. Absent = the pre-split world, where everything was a chat model.
  const { data: allModels, isLoading, isError } = useGetModelsQuery();
  const models = useMemo(() => allModels?.filter(isTextModel), [allModels]);

  const current = models?.find((m) => m.slug === selectedModel);

  // Self-heal a stale selection: chatSlice seeds `selectedModel` with DEFAULT_MODEL
  // before this query resolves, and an admin can disable the model a user had picked.
  // Either way we quietly fall back to the first live model — no error surfaced.
  useEffect(() => {
    if (!models || models.length === 0) return;
    if (models.some((m) => m.slug === selectedModel)) return;
    dispatch(setModel(models[0].slug));
  }, [models, selectedModel, dispatch]);

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-sm text-gray-400"
        aria-busy="true"
      >
        <Spinner className="h-3 w-3 border" />
        <span>Loading models…</span>
      </div>
    );
  }

  if (isError || !models || models.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-sm text-gray-400">
        <span className="h-2 w-2 rounded-full bg-gray-600" />
        <span>{isError ? 'Models unavailable' : 'No models available'}</span>
      </div>
    );
  }

  // `current` can be momentarily undefined between the fetch landing and the
  // self-heal effect committing; show the model we are about to switch to.
  const active = current ?? models[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Model: ${active.name}`}
        className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-sm text-white hover:bg-surface-3"
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: active.colour_hex || FALLBACK_COLOUR }}
        />
        {active.name}
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-surface-3 bg-surface-1 p-1 shadow-2xl"
          >
            <p className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Select model</p>
            {models.map((m) => (
              <button
                key={m.slug}
                type="button"
                role="option"
                aria-selected={active.slug === m.slug}
                onClick={() => { dispatch(setModel(m.slug)); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: m.colour_hex || FALLBACK_COLOUR }}
                />
                <div className="text-left">
                  <p className="font-medium text-white">{m.name}</p>
                  {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                </div>
                {active.slug === m.slug && <span className="ml-auto text-potato-500">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
