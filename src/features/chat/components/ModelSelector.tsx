import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setModel } from '../chatSlice';
import { MODELS } from '../../../utils/modelConfig';

export function ModelSelector() {
  const dispatch      = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);
  const [open, setOpen] = useState(false);

  const current = MODELS.find((m) => m.slug === selectedModel) ?? MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-sm text-white hover:bg-surface-3"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: current.color }} />
        {current.name}
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-surface-3 bg-surface-1 p-1 shadow-2xl">
            <p className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Select model</p>
            {MODELS.map((m) => (
              <button
                key={m.slug}
                onClick={() => { dispatch(setModel(m.slug)); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                <div className="text-left">
                  <p className="font-medium text-white">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.description}</p>
                </div>
                {selectedModel === m.slug && <span className="ml-auto text-potato-500">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
