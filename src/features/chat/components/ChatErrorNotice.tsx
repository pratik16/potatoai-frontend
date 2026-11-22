import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setStreamError } from '../chatSlice';
import type { ChatStreamError } from '../../../types/chat.types';

interface ChatErrorNoticeProps {
  /** Re-sends the failed turn (same client_message_id); shown for retryable codes only. */
  onRetry: (retry: NonNullable<ChatStreamError['retry']>) => void;
}

/** "3:42 pm (in 12 min)" for a reset time; seconds when it's under a minute away. */
function formatReset(retryAt: number, now: number): string {
  const secs = Math.max(0, Math.ceil((retryAt - now) / 1000));
  const clock = new Date(retryAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (secs < 60) return `${clock} (in ${secs} second${secs === 1 ? '' : 's'})`;
  const mins = Math.ceil(secs / 60);
  return `${clock} (in ${mins} min)`;
}

const actionClass =
  'inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-xs font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500';

/**
 * The last failed send, with the action that fixes it (replica U03). Branches on the
 * API `code` only:
 *   INSUFFICIENT_CREDITS → link to /usage
 *   CONTEXT_TOO_LONG     → "Start a new chat"
 *   RATE_LIMIT_EXCEEDED  → when it resets, if the API sent retry_after(_seconds)
 *   PROVIDER_ERROR, timeouts, dropped connections → "Try again" (resumes the same turn)
 * EMAIL_NOT_VERIFIED never lands here: useChat routes it to /verify-email.
 */
export function ChatErrorNotice({ onRetry }: ChatErrorNoticeProps) {
  const dispatch     = useAppDispatch();
  const navigate     = useNavigate();
  const error        = useAppSelector((s) => s.chat.streamError);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const isStreaming  = useAppSelector((s) => s.streaming.isStreaming);

  const [now, setNow] = useState(() => Date.now());
  const retryAt = error?.retryAt ?? null;
  useEffect(() => {
    if (!retryAt) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [retryAt]);

  // Belongs to another chat (or none): don't follow the user around.
  if (!error || isStreaming || (error.chatId ?? null) !== (activeChatId ?? null)) return null;

  const dismiss = () => dispatch(setStreamError(null));
  const resetPassed = retryAt !== null && retryAt <= now;

  let action: React.ReactNode = null;
  let detail: string | null = null;

  switch (error.code) {
    case 'INSUFFICIENT_CREDITS':
      detail = 'Credits top up automatically. See your balance and when it refills.';
      action = (
        <Link to="/usage" className={`${actionClass} bg-potato-600 text-white hover:bg-potato-700`}>
          View credits
        </Link>
      );
      break;
    case 'CONTEXT_TOO_LONG':
      detail = 'Start a new chat, or pick a model with a larger context window.';
      action = (
        <button
          type="button"
          onClick={() => { dismiss(); navigate('/chat/new'); }}
          className={`${actionClass} bg-potato-600 text-white hover:bg-potato-700`}
        >
          Start a new chat
        </button>
      );
      break;
    case 'RATE_LIMIT_EXCEEDED':
      if (retryAt === null) detail = 'Wait a moment, then try again.';
      else if (resetPassed) detail = 'The limit has reset. You can send again.';
      else detail = `It resets at ${formatReset(retryAt, now)}.`;
      break;
    default:
      if (error.retry) {
        const retry = error.retry;
        action = (
          <button
            type="button"
            onClick={() => onRetry(retry)}
            className={`${actionClass} bg-surface-3 text-white hover:bg-surface-4`}
          >
            Try again
          </button>
        );
      }
  }

  return (
    <div
      role="alert"
      data-testid="chat-error"
      data-code={error.code}
      className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3 py-2.5 text-sm"
      style={{
        borderColor:     'var(--color-error, #dc2626)',
        backgroundColor: 'var(--color-error-muted, rgba(220, 38, 38, 0.08))',
      }}
    >
      <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-error, #dc2626)' }} aria-hidden="true" />
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium text-white">{error.message}</p>
        {detail && <p className="mt-0.5 text-xs text-gray-400">{detail}</p>}
      </div>
      {action}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss error"
        className="shrink-0 rounded p-1 text-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
