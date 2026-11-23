import { useState } from 'react';
import { clsx } from 'clsx';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { showToast } from '../../../app/uiSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useChat, isServerMessageId } from '../../../hooks/useChat';
import { updateMessageById } from '../chatSlice';
import { useSubmitFeedbackMutation } from '../chatApi';
import type { FeedbackVote, Message } from '../../../types/chat.types';

/** What Regenerate needs about this reply's place in the transcript (computed by ChatArea). */
export interface RegenerateTarget {
  /** The user message this reply answers: the PATCH target. */
  userMessageId: string;
  userContent:   string;
  /** Messages after this reply. The API deletes them too, so >0 asks for confirmation. */
  laterCount:    number;
}

interface MessageActionsProps {
  message:     Message;
  /** Omitted on read-only views (a shared chat): only Copy is offered. */
  regenerate?: RegenerateTarget | null;
  readOnly?:   boolean;
}

// h-7/w-7 for a mouse; 44px targets on touch screens (U01). The ring shows keyboard focus.
const iconButton =
  'inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors ' +
  'hover:bg-surface-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500 ' +
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent ' +
  '[@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

const pluralMessages = (n: number) => (n === 1 ? 'the message after it' : `the ${n} messages after it`);

/**
 * Per-reply actions: copy, rate (F005) and regenerate (F004).
 *
 * Visibility (U01): always shown where there is no hover (touch screens); on a
 * mouse/trackpad they fade in on hover, and on keyboard focus anywhere inside.
 */
export function MessageActions({ message, regenerate, readOnly = false }: MessageActionsProps) {
  const dispatch     = useAppDispatch();
  const chatId       = useAppSelector((s) => s.chat.activeChatId);
  const isStreaming  = useAppSelector((s) => s.streaming.isStreaming);
  const showTokens   = useAppSelector((s) => s.auth.user?.show_token_count === true);
  const [submitFeedback] = useSubmitFeedbackMutation();
  const { regenerate: runRegenerate } = useChat();

  const [votePending, setVotePending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const msgId   = message._id ?? message.id;
  const current = message.feedback ?? null;
  const canRate = !readOnly && !!chatId && isServerMessageId(msgId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      dispatch(showToast({ message: 'Copied to clipboard', type: 'success' }));
    } catch {
      dispatch(showToast({ message: "Couldn't copy. Select the text and copy it instead.", type: 'error' }));
    }
  };

  // Optimistic, with rollback. Clicking the selected thumb again clears the rating.
  const rate = async (vote: FeedbackVote) => {
    if (!canRate || votePending) return;
    const next = current === vote ? null : vote;
    dispatch(updateMessageById({ id: msgId, update: { feedback: next } }));
    setVotePending(true);
    try {
      await submitFeedback({ chatId: chatId!, msgId, vote: next }).unwrap();
    } catch {
      dispatch(updateMessageById({ id: msgId, update: { feedback: current } }));
      dispatch(showToast({ message: "Couldn't save your rating. Please try again.", type: 'error' }));
    } finally {
      setVotePending(false);
    }
  };

  // The user message must be saved (server id) before the PATCH can target it: right
  // after a send its id is the optimistic one until the transcript refetch lands.
  const regenSynced    = !!regenerate && isServerMessageId(regenerate.userMessageId);
  const regenBlocked   = isStreaming || !regenSynced;
  const regenTitle     = isStreaming
    ? 'Wait for the current reply to finish'
    : !regenSynced ? 'Saving this reply…' : 'Regenerate reply';

  const startRegenerate = () => {
    if (!regenerate || regenBlocked) return;
    runRegenerate({ userMessageId: regenerate.userMessageId, content: regenerate.userContent });
  };

  const onRegenerateClick = () => {
    if (!regenerate || regenBlocked) return;
    // Contract phase1.md §2: confirm only when the PATCH would delete more than this reply.
    if (regenerate.laterCount > 0) setConfirmOpen(true);
    else startRegenerate();
  };

  return (
    <div
      role="group"
      aria-label="Reply actions"
      data-testid="reply-actions"
      className={clsx(
        'mt-1 flex items-center gap-0.5 opacity-100 transition-opacity',
        // Hover-reveal only where hovering exists; focus-within keeps it visible for keyboards.
        '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover:opacity-100 focus-within:opacity-100',
      )}
    >
      <button type="button" onClick={copy} aria-label="Copy reply" title="Copy reply" className={iconButton}>
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {canRate && (
        <>
          <button
            type="button"
            onClick={() => rate('up')}
            aria-label="Good reply"
            title={current === 'up' ? 'Rated good (click to clear)' : 'Good reply'}
            aria-pressed={current === 'up'}
            aria-disabled={votePending || undefined}
            aria-busy={votePending || undefined}
            className={clsx(iconButton, current === 'up' && 'bg-potato-500/10 text-potato-600 hover:text-potato-700')}
          >
            <ThumbsUp className={clsx('h-3.5 w-3.5', current === 'up' && 'fill-current')} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => rate('down')}
            aria-label="Bad reply"
            title={current === 'down' ? 'Rated bad (click to clear)' : 'Bad reply'}
            aria-pressed={current === 'down'}
            aria-disabled={votePending || undefined}
            aria-busy={votePending || undefined}
            className={clsx(iconButton, current === 'down' && 'bg-potato-500/10 text-potato-600 hover:text-potato-700')}
          >
            <ThumbsDown className={clsx('h-3.5 w-3.5', current === 'down' && 'fill-current')} aria-hidden="true" />
          </button>
        </>
      )}

      {!readOnly && regenerate && (
        <button
          type="button"
          onClick={onRegenerateClick}
          aria-label="Regenerate reply"
          title={regenTitle}
          // aria-disabled, not disabled: the button stays focusable and its title explains why.
          aria-disabled={regenBlocked || undefined}
          className={iconButton}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}

      {showTokens && (message.output_tokens ?? 0) > 0 && (
        <span className="ml-2 text-xs text-gray-600" data-testid="token-count">{message.output_tokens} tokens</span>
      )}

      {regenerate && (
        <ConfirmDialog
          open={confirmOpen}
          title="Regenerate this reply?"
          message={`Regenerating replaces this reply and deletes ${pluralMessages(regenerate.laterCount)}.`}
          confirmLabel="Regenerate"
          destructive
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); startRegenerate(); }}
        />
      )}
    </div>
  );
}
