import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Message, Attachment } from '../../../types/chat.types';
import { useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/ui/Avatar';
import { MODEL_COLORS, MODEL_NAMES } from '../../../utils/modelConfig';
import { ThinkingBlock } from './ThinkingBlock';
import { MessageActions } from './MessageActions';

function AttachmentImages({ attachments }: { attachments: Attachment[] }) {
  const images = attachments.filter((a) => a.mime_type?.startsWith('image/'));
  if (!images.length) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {images.map((img, i) => (
        <a key={i} href={img.s3_url} target="_blank" rel="noopener noreferrer" title={img.filename}>
          <img
            src={img.s3_url}
            alt={img.filename}
            className="max-h-48 max-w-xs rounded-xl border border-white/10 object-cover shadow"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </a>
      ))}
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const user = useAppSelector((s) => s.auth.user);
  const isUser = message.role === 'user';

  return (
    <div className={clsx('group mb-6 flex gap-3', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <Avatar src={user?.avatar_url} name={user?.full_name ?? user?.username} size="sm" />
      ) : (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: MODEL_COLORS[message.model ?? ''] ?? '#7c3aed' }}
        >
          {(MODEL_NAMES[message.model ?? ''] ?? 'AI')[0]}
        </div>
      )}

      <div className={clsx('max-w-[75%]', isUser && 'text-right')}>
        {!isUser && message.model && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: MODEL_COLORS[message.model] }}>
              PotatoChat
            </span>
            <span className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-gray-400">
              {MODEL_NAMES[message.model] ?? message.model}
            </span>
          </div>
        )}

        {message.thinking_content && <ThinkingBlock content={message.thinking_content} />}

        {/* Uploaded image attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <AttachmentImages attachments={message.attachments} />
        )}

        {(isUser || message.content?.trim()) && (
          <div className={clsx(isUser ? 'rounded-2xl bg-surface-2 px-4 py-3 text-sm text-white' : 'prose prose-invert prose-sm max-w-none')}>
            {isUser ? (
              <span className="whitespace-pre-wrap">{message.content}</span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}>
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Generated / edited image output */}
        {!isUser && message.image_asset_id && !message.image_url && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating image…
          </div>
        )}
        {!isUser && message.image_url && (
          <div className="mt-3">
            <a href={message.image_url} target="_blank" rel="noopener noreferrer" title="View full size">
              <img
                src={message.image_url}
                alt="Generated"
                className="max-w-sm rounded-xl border border-white/10 shadow-lg"
                style={{ maxWidth: '100%' }}
              />
            </a>
          </div>
        )}

        {!isUser && <MessageActions message={message} />}
      </div>
    </div>
  );
}
