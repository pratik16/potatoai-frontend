import { useAppSelector } from '../../../app/hooks';
import { MODEL_COLORS, MODEL_NAMES } from '../../../utils/modelConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThinkingBlock } from './ThinkingBlock';

export function TypingIndicator({ content, thinking }: { content: string; thinking: string }) {
  const model = useAppSelector((s) => s.chat.selectedModel);

  return (
    <div className="group mb-6 flex gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: MODEL_COLORS[model] ?? '#7c3aed' }}
      >
        {(MODEL_NAMES[model] ?? 'AI')[0]}
      </div>

      <div className="max-w-[75%]">
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
