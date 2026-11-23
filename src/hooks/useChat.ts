import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  startStream, appendToken, appendThinking, updateArtifact, setRoutedModel, stopStream, resetStream,
} from '../features/chat/streamingSlice';
import {
  addMessage, prependChat, setActiveChat, updateMessageById, setOutOfCredits, setStreamError,
  setMessages, truncateAfter,
} from '../features/chat/chatSlice';
import { updateUser } from '../features/auth/authSlice';
import { showToast, requireEmailVerification } from '../app/uiSlice';
import { isEmailNotVerified } from '../features/auth/verification';
import { retryAfterSeconds, type ApiErrorBody } from '../utils/apiError';
import { chatApi } from '../features/chat/chatApi';
import { settingsApi } from '../features/settings/settingsApi';
import type { Message, StreamRetry } from '../types/chat.types';

const STREAM_TIMEOUT_MS = 30_000;
// After a client abort (Stop, or the idle timeout) the server only notices on a later
// failed write and then saves the partial reply: measured 2.5-2.9s on localtest for a
// 1 token/s reply, sooner for faster ones. The transcript refetches at each of these
// delays; only the first one that finds the saved reply changes anything on screen, and
// until then chatSlice.setMessages keeps the on-screen partial.
const ABORT_SETTLE_MS = [1_500, 3_000, 4_500, 8_000];

const IMAGE_GAVE_UP = "The image didn't finish in time. Please try again.";
const IMAGE_FAILED  = "Couldn't generate that image. Please try again.";

export async function pollImageAsset(
  assetId: string,
  msgId: string,
  token: string,
  dispatch: AppDispatch,
  attempt = 0,
) {
  // Every exit from this function has to land on either an image or an error.
  // Returning silently leaves "Generating image…" spinning forever, which is
  // indistinguishable from a job that is merely slow.
  if (attempt > 30) {
    dispatch(updateMessageById({ id: msgId, update: { image_error: IMAGE_GAVE_UP } }));
    return;
  }
  await new Promise((r) => setTimeout(r, attempt === 0 ? 3000 : 4000));
  try {
    const res = await fetch(`/api/images/${assetId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      dispatch(updateMessageById({ id: msgId, update: { image_error: IMAGE_FAILED } }));
      return;
    }
    const data = await res.json();
    if (['done', 'SUCCEEDED', 'completed'].includes(data.status) && data.url) {
      dispatch(updateMessageById({ id: msgId, update: { image_url: data.url, image_error: null } }));
    } else if (['failed', 'FAILED', 'error'].includes(data.status)) {
      dispatch(updateMessageById({ id: msgId, update: { image_error: IMAGE_FAILED } }));
    } else {
      pollImageAsset(assetId, msgId, token, dispatch, attempt + 1);
    }
  } catch {
    pollImageAsset(assetId, msgId, token, dispatch, attempt + 1);
  }
}

// Keys are the SCREAMING_SNAKE_CASE `code` values the API returns — both on an HTTP
// error body and on the `error` SSE frame. See backend/CLAUDE.md §1.
// NOTE: DUPLICATE_MESSAGE_ID is intentionally not here — it is not a user-facing
// failure, see the dedicated handling below.
export const STREAM_ERRORS: Record<string, string> = {
  RATE_LIMIT_EXCEEDED:   "You've hit the message limit for now.",
  INSUFFICIENT_CREDITS:  "You're out of credits.",
  CONTEXT_TOO_LONG:      'This chat is too long for the selected model.',
  PROVIDER_ERROR:        'AI provider error. Please try again.',
  MODEL_DISABLED:        'This model has been turned off. Pick another model to continue.',
  MODEL_NOT_FOUND:       'That model is no longer available. Pick another model to continue.',
  MODEL_PRICING_MISSING: 'This model is temporarily unavailable. Pick another model or try again later.',
  // Client-side codes: failures that never reached (or never came back from) the API.
  STREAM_TIMEOUT:        'The response timed out.',
  NETWORK_ERROR:         'Connection lost before the reply finished.',
};

/**
 * Codes whose API `message` is shown as-is (it carries specifics, such as the open-stream
 * limit), with this copy only as the fallback when the body has none.
 */
const SERVER_COPY_FALLBACKS: Record<string, string> = {
  // Contract phase1.md §1 (A04): 429 before the stream, nothing charged.
  STREAM_LIMIT: 'You already have replies generating. Wait for one to finish or stop it.',
};

function errorCopy(code: string, apiMessage?: string): string {
  if (code in SERVER_COPY_FALLBACKS) return apiMessage || SERVER_COPY_FALLBACKS[code];
  return STREAM_ERRORS[code] ?? apiMessage ?? 'Something went wrong. Please try again.';
}

/**
 * Codes where repeating the same turn can succeed. "Try again" reuses the failed
 * attempt's client_message_id, so the backend resumes the turn (or answers 409
 * DUPLICATE_MESSAGE_ID if it actually landed) instead of saving and billing it twice.
 */
const RETRYABLE = new Set(['PROVIDER_ERROR', 'STREAM_TIMEOUT', 'NETWORK_ERROR', 'STREAM_LIMIT']);

/** A saved (server) message id, as opposed to the optimistic client UUID. */
export const isServerMessageId = (id: string | undefined | null): id is string =>
  !!id && /^[0-9a-f]{24}$/i.test(id);

// One stream per tab, so one controller at module scope rather than a ref per hook
// instance: the composer's Stop button and a reply's Regenerate button are different
// useChat() callers, and Stop has to abort whichever of them started the stream.
let activeController: AbortController | null = null;

export interface SendOptions {
  /** Re-run an earlier send that failed (from the error notice), instead of starting a new turn. */
  retry?: Extract<StreamRetry, { kind: 'send' }>;
}

export interface RegenerateRequest {
  /** The user message whose reply is replaced. Must be a saved (server) id. */
  userMessageId:    string;
  /** That user message's text; the PATCH resends it unchanged. */
  content:          string;
  /** Set only by "Try again", to repeat a failed regenerate as the same action. */
  clientMessageId?: string;
}

/** One streamed request: a new turn (POST) or a regenerated reply (PATCH). */
interface StreamTurn {
  chatId:     string;
  method:     'POST' | 'PATCH';
  url:        string;
  /** Built per attempt: the silent PROVIDER_ERROR retry sends it again. */
  makeBody:   () => { body: BodyInit; json: boolean };
  /** "Try again" for this turn. For a send, `persisted` is filled in from how far it got. */
  retry:      StreamRetry;
  /** The API refused the turn before the stream started: undo the optimistic transcript. */
  onRefused?: () => void;
}

export function useChat() {
  const dispatch      = useAppDispatch();
  const navigate      = useNavigate();
  const store         = useStore<RootState>();
  const token         = useAppSelector((s) => s.auth.token);
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);
  const activeChatId  = useAppSelector((s) => s.chat.activeChatId);

  /**
   * Runs one turn's SSE stream: the idle timer, Stop, the silent PROVIDER_ERROR retry,
   * the `done` commit and every error path. The caller has already dispatched
   * startStream() and put its optimistic messages on screen.
   */
  const runTurn = useCallback(async (turn: StreamTurn) => {
    if (!token) return;
    const { chatId } = turn;

    // True once the API accepted the request (2xx) and the stream began. A send that
    // got that far has its user message saved server-side.
    let accepted = false;

    // One place every failure lands, before the stream (HTTP error body) or mid-stream
    // (`error` SSE frame). Branches on `code` only — the copy is for display.
    const reportError = (code: string, apiMessage?: string, retryAfter: number | null = null) => {
      if (code === 'EMAIL_NOT_VERIFIED') {
        // Contract phase0b-auth.md §3: paid call from an unverified account.
        dispatch(requireEmailVerification({ email: null }));
        return;
      }
      if (code === 'INSUFFICIENT_CREDITS') {
        dispatch(setOutOfCredits(true));
        // The rejection means the server balance is lower than we think.
        dispatch(settingsApi.util.invalidateTags(['Credits']));
      }
      const retry: StreamRetry | null = !RETRYABLE.has(code)
        ? null
        : turn.retry.kind === 'send' ? { ...turn.retry, persisted: accepted } : turn.retry;
      dispatch(setStreamError({
        code,
        message: errorCopy(code, apiMessage),
        chatId,
        retryAt: retryAfter ? Date.now() + retryAfter * 1000 : null,
        retry,
      }));
    };

    const controller = new AbortController();
    activeController = controller;

    // 30s timeout on last received token
    let lastTokenAt   = Date.now();
    let retryCount    = 0;
    const timeoutId   = setInterval(() => {
      if (Date.now() - lastTokenAt > STREAM_TIMEOUT_MS) {
        clearInterval(timeoutId);
        controller.abort();
        dispatch(resetStream());
        reportError('STREAM_TIMEOUT');
      }
    }, 1000);

    // The single exit for this turn however it ends: done, error, refusal, Stop, the
    // idle timeout, or Stop pressed during the silent retry's 2s wait (which used to
    // skip this entirely and leave the idle timer running into the next stream).
    const finish = () => {
      clearInterval(timeoutId);
      dispatch(stopStream());
      if (activeController === controller) activeController = null;
      const refetch = () => {
        dispatch(chatApi.util.invalidateTags([{ type: 'Chat', id: chatId }, 'Chat']));
        // Every turn now costs credits, so the cached balance is stale the
        // moment a stream ends. Nothing invalidated this tag before, which
        // left Settings/Billing showing a balance that never moved.
        dispatch(settingsApi.util.invalidateTags(['Credits']));
      };
      if (!controller.signal.aborted) { refetch(); return; }
      ABORT_SETTLE_MS.forEach((ms) => setTimeout(() => {
        // A newer stream owns the transcript now; its own finish() refetches.
        if (!store.getState().streaming.isStreaming) refetch();
      }, ms));
    };

    const doStream = async () => {
      const { body, json } = turn.makeBody();
      const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' };
      if (json) headers['Content-Type'] = 'application/json';

      let pendingImageAssetId: string | null = null;
      let pendingImageMsgId:   string | null = null;
      // Set when this attempt hands over to the silent PROVIDER_ERROR retry: the
      // stream is still live, so `finally` must not tear down the timer, the Stop
      // button or the typing indicator underneath it.
      let willRetry = false;

      try {
        const res = await fetch(turn.url, {
          method: turn.method, headers, body, signal: controller.signal,
        });

        if (!res.ok) {
          const err: ApiErrorBody = await res.json().catch(() => ({}));
          // Branch on the machine-readable code, never the copy — see web/CLAUDE.md.
          if (err.code === 'DUPLICATE_MESSAGE_ID') {
            // This exact turn already landed server-side on an earlier attempt (the
            // PROVIDER_ERROR retry raced a send that actually succeeded, or "Try
            // again" repeated a regenerate that had finished). There is nothing to
            // show and nothing to re-send — just resync the transcript from the
            // server's copy via the tag invalidation in `finally`.
            dispatch(resetStream());
            return;
          }
          // Refused before the stream: STREAM_LIMIT (429), INSUFFICIENT_CREDITS (402),
          // EMAIL_NOT_VERIFIED (403), CONTEXT_TOO_LONG (422), RATE_LIMIT_EXCEEDED, ...
          dispatch(resetStream());
          turn.onRefused?.();
          reportError(err.code ?? 'SERVER_ERROR', err.message ?? err.detail, retryAfterSeconds(err));
          return;
        }

        accepted = true;
        // The turn was accepted, so the account is spendable again.
        dispatch(setOutOfCredits(false));

        const reader  = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer    = '';
        let assistantContent  = '';
        let assistantThinking = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          lastTokenAt = Date.now();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;

            try {
              const evt = JSON.parse(raw);
              switch (evt.type) {
                case 'token':
                  assistantContent += evt.content ?? '';
                  dispatch(appendToken(evt.content ?? ''));
                  lastTokenAt = Date.now();
                  break;
                case 'thinking':
                  assistantThinking += evt.content ?? '';
                  dispatch(appendThinking(evt.content ?? ''));
                  break;
                case 'artifact_start':
                case 'artifact_token':
                  dispatch(updateArtifact({ artifact_id: evt.artifact_id, type: evt.artifact_type, title: evt.title, content: evt.content ?? '' }));
                  break;
                case 'model_route':
                  // Only sent when Auto routed this turn, and always before the first
                  // token — lets the typing indicator show the real model immediately
                  // instead of a generic "Auto" placeholder for the whole generation.
                  dispatch(setRoutedModel({
                    model:         evt.model,
                    model_name:    evt.model_name,
                    colour_hex:    evt.colour_hex,
                    question_type: evt.question_type,
                    source:        evt.source,
                  }));
                  break;
                case 'done': {
                  const msgId = evt.message_id ?? crypto.randomUUID();
                  const assistantMsg: Message = {
                    id: msgId, _id: msgId,
                    chat_id: chatId, role: 'assistant', content: assistantContent,
                    model: evt.model_used ?? selectedModel, thinking_content: assistantThinking || null,
                    artifacts: [], attachments: [],
                    input_tokens: evt.usage?.input_tokens ?? null,
                    output_tokens: evt.usage?.output_tokens ?? null,
                    credits_deducted: evt.credits_deducted ?? null,
                    edited_at: null, is_branch_root: false, created_at: new Date().toISOString(),
                    image_asset_id: evt.image_asset_id ?? null,
                    image_url: null,
                    routed_from: evt.routed_from ?? null,
                    question_type: evt.question_type ?? null,
                    feedback: null,
                  };
                  dispatch(addMessage(assistantMsg));
                  if (evt.image_asset_id) {
                    pendingImageAssetId = evt.image_asset_id;
                    pendingImageMsgId   = msgId;
                  }
                  if (evt.credit_balance != null) {
                    dispatch(updateUser({ credit_balance: evt.credit_balance }));
                  }
                  break;
                }
                case 'error': {
                  if (evt.code === 'PROVIDER_ERROR' && retryCount < 1) {
                    retryCount++;
                    willRetry = true;
                    setTimeout(() => {
                      // Stop pressed during the 2s wait: don't resurrect the stream.
                      if (controller.signal.aborted) { finish(); return; }
                      lastTokenAt = Date.now();
                      // Drop any partial text from the failed attempt; the resume
                      // regenerates the whole reply.
                      dispatch(startStream());
                      doStream();
                    }, 2000);
                    return;
                  }
                  if (evt.code === 'DUPLICATE_MESSAGE_ID') {
                    // Same turn already persisted (see the non-ok branch above) —
                    // just let `finally` refetch the chat instead of surfacing an error.
                    break;
                  }
                  reportError(evt.code ?? 'PROVIDER_ERROR', evt.message, retryAfterSeconds(evt));
                  break;
                }
              }
            } catch { /* non-JSON line */ }
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          reportError('NETWORK_ERROR');
        }
      } finally {
        if (!willRetry) finish();
        // else: the retry owns the stream (timer, Stop, indicator) from here.
      }

      // Poll for image result if an image-edit job was dispatched
      if (pendingImageAssetId && pendingImageMsgId) {
        pollImageAsset(pendingImageAssetId, pendingImageMsgId, token, dispatch);
      }
    };

    await doStream();
  }, [token, selectedModel, dispatch, store]);

  const sendMessage = useCallback(
    async (content: string, projectId: string | null = null, files: File[] = [], options: SendOptions = {}) => {
      if (!token) return;

      dispatch(startStream());
      dispatch(setStreamError(null));

      let chatId = activeChatId;

      if (!chatId) {
        try {
          const res = await fetch('/api/chats', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body:    JSON.stringify({ title: content.slice(0, 60), model: selectedModel, project_id: projectId }),
          });
          if (!res.ok) {
            const body: ApiErrorBody = await res.json().catch(() => ({}));
            if (isEmailNotVerified(res.status, body)) {
              dispatch(resetStream());
              dispatch(requireEmailVerification({ email: null }));
              return;
            }
            throw new Error('Failed to create chat');
          }
          const chat = await res.json();
          chatId = chat.id ?? chat._id;
          dispatch(setActiveChat(chatId));
          dispatch(prependChat({ ...chat, id: chatId, _id: chatId }));
          navigate(`/chat/${chatId}`, { replace: true });
        } catch {
          dispatch(resetStream());
          dispatch(showToast({ message: 'Failed to create chat', type: 'error' }));
          return;
        }
      }
      const turnChatId = chatId!;

      // Clear draft on send
      localStorage.removeItem(`draft_${turnChatId}`);

      // Build optimistic attachments with local blob URLs so images show immediately
      const optimisticAttachments = files
        .filter((f) => f.type.startsWith('image/'))
        .map((f) => ({
          filename:  f.name,
          mime_type: f.type,
          s3_url:    URL.createObjectURL(f),
          size_bytes: f.size,
        }));

      // Generated once per turn (outside the stream attempt) so the PROVIDER_ERROR retry
      // resends the *same* id — that's what lets the backend recognize a retry as the
      // same turn instead of persisting and billing a second user message. It also
      // doubles as the optimistic message's id/_id: those are UI concerns only, and
      // there's no reason for the wire id and the local id to diverge.
      const retry = options.retry;
      const clientMessageId = retry?.clientMessageId ?? crypto.randomUUID();

      const userMsg: Message = {
        id: clientMessageId, _id: clientMessageId,
        chat_id: turnChatId, role: 'user', content,
        model: null, thinking_content: null, artifacts: [], attachments: optimisticAttachments,
        input_tokens: null, output_tokens: null, credits_deducted: null,
        edited_at: null, is_branch_root: false, created_at: new Date().toISOString(),
        image_asset_id: null, image_url: null,
      };
      // A retry of a turn the server saved has its user message on screen already
      // (under its server id). One the API refused up front was never saved, and the
      // post-error refetch removed its bubble: put it back once, keyed by the same id.
      const onScreen = store.getState().chat.activeMessages
        .some((m) => m.id === clientMessageId || m._id === clientMessageId);
      if (!retry || (!retry.persisted && !onScreen)) dispatch(addMessage(userMsg));

      await runTurn({
        chatId: turnChatId,
        method: 'POST',
        url:    `/api/chats/${turnChatId}/messages`,
        makeBody: () => {
          if (files.length > 0) {
            const fd = new FormData();
            fd.append('content', content);
            fd.append('model', selectedModel);
            fd.append('enable_thinking', '0');
            fd.append('client_message_id', clientMessageId);
            files.forEach((f) => fd.append('files[]', f));
            return { body: fd, json: false };
          }
          return {
            body: JSON.stringify({
              content, model: selectedModel, enable_thinking: false, enable_search: false,
              client_message_id: clientMessageId,
            }),
            json: true,
          };
        },
        retry: { kind: 'send', content, clientMessageId, persisted: false },
      });
    },
    [token, activeChatId, selectedModel, dispatch, navigate, store, runTurn],
  );

  /**
   * Replaces the reply to `userMessageId` with a freshly streamed one (F004), via
   * `PATCH /api/chats/{id}/messages/{userMessageId}`. The API deletes every message
   * after the user message, so the caller confirms first when there are any beyond
   * the reply itself (contract phase1.md §2). Same streaming path as a send: typing
   * indicator, Stop, the U03 error notice and its "Try again".
   */
  const regenerate = useCallback(async ({ userMessageId, content, clientMessageId }: RegenerateRequest) => {
    const state  = store.getState();
    const chatId = state.chat.activeChatId;
    if (!token || !chatId || !isServerMessageId(userMessageId) || state.streaming.isStreaming) return;

    const before  = state.chat.activeMessages;
    const hasMore = state.chat.hasMoreMessages;
    const id      = clientMessageId ?? crypto.randomUUID();

    dispatch(startStream());
    dispatch(setStreamError(null));
    // Mirror the server: the old reply and everything after it go, and the new reply
    // streams in under the user message.
    dispatch(truncateAfter(userMessageId));

    await runTurn({
      chatId,
      method: 'PATCH',
      url:    `/api/chats/${chatId}/messages/${userMessageId}`,
      makeBody: () => ({
        body: JSON.stringify({ content, model: selectedModel, client_message_id: id }),
        json: true,
      }),
      retry: { kind: 'regenerate', userMessageId, content, clientMessageId: id },
      // A refusal before the stream changes nothing server-side (contract phase1.md
      // W3/W4), so give the transcript back; the refetch in `finally` confirms it.
      onRefused: () => {
        if (store.getState().chat.activeChatId === chatId) {
          dispatch(setMessages({ messages: before, has_more: hasMore }));
        }
      },
    });
  }, [token, selectedModel, dispatch, store, runTurn]);

  /** Re-runs whatever failed, from the U03 notice's "Try again". */
  const retryTurn = useCallback((retry: StreamRetry, projectId: string | null = null) => {
    if (retry.kind === 'regenerate') {
      return regenerate({ userMessageId: retry.userMessageId, content: retry.content, clientMessageId: retry.clientMessageId });
    }
    return sendMessage(retry.content, projectId, [], { retry });
  }, [regenerate, sendMessage]);

  const stopGeneration = useCallback(() => {
    const { streaming, chat } = store.getState();
    activeController?.abort();
    activeController = null;
    // Keep what already streamed on screen. The server saves it as the reply once it
    // notices the abort, and the delayed refetch in finish() swaps in that saved copy.
    // Without this a stopped regenerate looked like it had deleted the reply outright.
    if (streaming.isStreaming && chat.activeChatId && (streaming.currentContent || streaming.thinkingContent)) {
      const id = `partial-${crypto.randomUUID()}`;
      dispatch(addMessage({
        id, _id: id, chat_id: chat.activeChatId, role: 'assistant',
        content: streaming.currentContent,
        model: streaming.routedModel?.model ?? selectedModel,
        thinking_content: streaming.thinkingContent || null,
        artifacts: [], attachments: [],
        input_tokens: null, output_tokens: null, credits_deducted: null,
        edited_at: null, is_branch_root: false, created_at: new Date().toISOString(),
        image_asset_id: null, image_url: null, feedback: null,
      }));
    }
    dispatch(resetStream());
  }, [dispatch, store, selectedModel]);

  return { sendMessage, regenerate, retryTurn, stopGeneration };
}
