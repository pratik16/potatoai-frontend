import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Message, Attachment } from '../../../types/chat.types';
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
            className="max-h-48 max-w-xs rounded-2xl object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </a>
      ))}
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="mb-8 flex justify-end">
        <div className="max-w-[75%]">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex justify-end">
              <AttachmentImages attachments={message.attachments} />
            </div>
          )}
          <div className="rounded-3xl bg-surface-2 px-5 py-3.5 text-[15px] leading-6 text-white">
            <span className="whitespace-pre-wrap">{message.content}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group mb-8">
      {message.thinking_content && <ThinkingBlock content={message.thinking_content} />}

      {message.sources && message.sources.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {message.sources.map((s, i) => (
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
      )}

      {message.attachments && message.attachments.length > 0 && (
        <AttachmentImages attachments={message.attachments} />
      )}

      {message.content?.trim() && (
        <div className="prose prose-invert max-w-none chat-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Generated / edited image output */}
      {message.image_asset_id && !message.image_url && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Generating image…
        </div>
      )}
      {message.image_url && (
        <div className="mt-3">
          <a href={message.image_url} target="_blank" rel="noopener noreferrer" title="View full size">
            <img
              src={message.image_url}
              alt="Generated"
              className="max-w-sm rounded-2xl"
              style={{ maxWidth: '100%' }}
            />
          </a>
        </div>
      )}

      <MessageActions message={message} />
    </div>
  );
}
