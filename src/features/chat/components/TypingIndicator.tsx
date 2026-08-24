import { Sparkles } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { MODEL_COLORS, MODEL_NAMES } from '../../../utils/modelConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThinkingBlock } from './ThinkingBlock';

export function TypingIndicator({ content, thinking }: { content: string; thinking: string }) {
  const model = useAppSelector((s) => s.chat.selectedModel);
  // Set once the `model_route` SSE frame lands — before that (or for a manual
  // pick) this stays null and we fall back to the selected model, same as before.
  const routedModel = useAppSelector((s) => s.streaming.routedModel);

  const avatarColour = routedModel?.colour_hex ?? MODEL_COLORS[model] ?? '#7c3aed';
  const avatarLetter = (routedModel?.model_name ?? MODEL_NAMES[model] ?? 'AI')[0];

  return (
    <div className="group mb-6 flex gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: avatarColour }}
      >
        {avatarLetter}
      </div>

      <div className="max-w-[75%]">
        {routedModel && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: routedModel.colour_hex }}>
              PotatoChat
            </span>
            <span className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-gray-400">
              {routedModel.model_name}
            </span>
            <span className="flex items-center gap-1 rounded bg-potato-500/10 px-1.5 py-0.5 text-xs text-potato-500">
              <Sparkles className="h-3 w-3" />
              Auto
            </span>
          </div>
        )}

        {thinking && <ThinkingBlock content={thinking} />}

        {content ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-1 py-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
