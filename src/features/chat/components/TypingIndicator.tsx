import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Citation } from '../../../types/chat.types';
import { ThinkingBlock } from './ThinkingBlock';

function SourcesList({ sources }: { sources: Citation[] }) {
  if (!sources.length) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <a
          key={`${s.url}-${i}`}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[14rem] truncate rounded-full bg-surface-2 px-3 py-1 text-xs text-gray-400 transition-colors hover:text-white"
          title={s.title || s.url}
        >
          {i + 1}. {s.title || s.url}
        </a>
      ))}
    </div>
  );
}

export function TypingIndicator({
  content,
  thinking,
  status,
  sources,
}: {
  content: string;
  thinking: string;
  status?: 'analyzing' | 'searching' | null;
  sources?: Citation[];
}) {
  const statusLabel =
    status === 'analyzing' ? 'Analyzing query…' :
    status === 'searching' ? 'Searching the web…' :
    null;

  // Layout below must stay identical to the assistant branch of MessageBubble,
  // or the response visibly shifts the moment streaming finishes.
  return (
    <div className="group mb-8">
      {thinking && <ThinkingBlock content={thinking} />}
      {sources && sources.length > 0 && <SourcesList sources={sources} />}

      {content ? (
        <div className="prose prose-invert max-w-none chat-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 py-2 text-sm text-gray-400">
          <span className="h-2 w-2 rounded-full bg-potato-500 animate-pulse-dot" />
          {statusLabel && <span>{statusLabel}</span>}
        </div>
      )}
    </div>
  );
}
