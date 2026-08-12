import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setModel } from '../chatSlice';
import { MODELS } from '../../../utils/modelConfig';

/** "Pratik" from "Pratik Sharma" — Gemini greets by first name only. */
function firstName(full?: string | null, fallback?: string | null): string | null {
  const name = (full ?? fallback ?? '').trim();
  return name ? name.split(/\s+/)[0] : null;
}

export function EmptyState() {
  const dispatch      = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);
  const user          = useAppSelector((s) => s.auth.user);

  const name = firstName(user?.full_name, user?.username);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6 pb-44 pt-20 text-center">
      <div className="aurora" aria-hidden="true">
        <div className="aurora__strip animate-aurora" />
      </div>

      <div className="relative">
        <h1 className="mb-10 text-4xl font-light leading-[1.2] chat-prose">
          {name ? `What can I help with, ${name}?` : 'What can I help with?'}
        </h1>

        {/* Kept because picking a model is real function, but deliberately
            quiet — only the selected one carries any colour. */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {MODELS.map((m) => {
            const active = selectedModel === m.slug;
            return (
              <button
                key={m.slug}
                onClick={() => dispatch(setModel(m.slug))}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors',
                  active ? 'bg-surface-2' : 'text-gray-500 hover:bg-surface-1 hover:text-gray-300',
                )}
                style={active ? { color: m.color } : undefined}
              >
                <span
                  className={clsx('h-1.5 w-1.5 rounded-full transition-opacity', !active && 'opacity-40')}
                  style={{ backgroundColor: m.color }}
                />
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
