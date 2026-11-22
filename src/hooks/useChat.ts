import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../app/store';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  startStream, appendToken, appendThinking, updateArtifact, setRoutedModel, stopStream, resetStream,
} from '../features/chat/streamingSlice';
import {
  addMessage, prependChat, setActiveChat, updateMessageById, setOutOfCredits, setStreamError,
} from '../features/chat/chatSlice';
import { updateUser } from '../features/auth/authSlice';
import { showToast, requireEmailVerification } from '../app/uiSlice';
import { isEmailNotVerified } from '../features/auth/verification';
import { retryAfterSeconds, type ApiErrorBody } from '../utils/apiError';
import { chatApi } from '../features/chat/chatApi';
import { settingsApi } from '../features/settings/settingsApi';
import type { Message } from '../types/chat.types';

const STREAM_TIMEOUT_MS = 30_000;

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
 * Codes where re-sending the same turn can succeed. "Try again" resends with the
 * same client_message_id, so the backend resumes the turn instead of saving and
 * billing a second copy of the user message.
 */
const RETRYABLE = new Set(['PROVIDER_ERROR', 'STREAM_TIMEOUT', 'NETWORK_ERROR']);

export interface SendOptions {
  /** Re-send an earlier turn that failed, instead of starting a new one. */
  retryClientMessageId?: string;
}

export function useChat() {
  const dispatch      = useAppDispatch();
  const navigate      = useNavigate();
  const token         = useAppSelector((s) => s.auth.token);
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);
  const activeChatId  = useAppSelector((s) => s.chat.activeChatId);
  const abortRef      = useRef<AbortController | null>(null);

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

      // Clear draft on send
      localStorage.removeItem(`draft_${chatId}`);

      // Build optimistic attachments with local blob URLs so images show immediately
      const optimisticAttachments = files
        .filter((f) => f.type.startsWith('image/'))
        .map((f) => ({
          filename:  f.name,
          mime_type: f.type,
          s3_url:    URL.createObjectURL(f),
          size_bytes: f.size,
        }));

      // Generated once per turn (outside doStream) so the PROVIDER_ERROR retry below
      // resends the *same* id — that's what lets the backend recognize a retry as the
      // same turn instead of persisting and billing a second user message. It also
      // doubles as the optimistic message's id/_id: those are UI concerns only, and
      // there's no reason for the wire id and the local id to diverge.
      const isRetry = !!options.retryClientMessageId;
      const clientMessageId = options.retryClientMessageId ?? crypto.randomUUID();

      const userMsg: Message = {
        id: clientMessageId, _id: clientMessageId,
        chat_id: chatId!, role: 'user', content,
        model: null, thinking_content: null, artifacts: [], attachments: optimisticAttachments,
        input_tokens: null, output_tokens: null, credits_deducted: null,
        edited_at: null, is_branch_root: false, created_at: new Date().toISOString(),
        image_asset_id: null, image_url: null,
      };
      // A retry resumes a turn whose user message is already on screen and on the server.
      if (!isRetry) dispatch(addMessage(userMsg));

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
        dispatch(setStreamError({
          code,
          message: STREAM_ERRORS[code] ?? apiMessage ?? 'Something went wrong. Please try again.',
          chatId:  chatId ?? null,
          retryAt: retryAfter ? Date.now() + retryAfter * 1000 : null,
          retry:   RETRYABLE.has(code) ? { content, clientMessageId } : null,
        }));
      };

      const controller = new AbortController();
      abortRef.current = controller;

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

      const doStream = async () => {
        let body: BodyInit;
        const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' };

        if (files.length > 0) {
          const fd = new FormData();
          fd.append('content', content);
          fd.append('model', selectedModel);
          fd.append('enable_thinking', '0');
          fd.append('client_message_id', clientMessageId);
          files.forEach((f) => fd.append('files[]', f));
          body = fd;
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({
            content, model: selectedModel, enable_thinking: false, enable_search: false,
            client_message_id: clientMessageId,
          });
        }

        let pendingImageAssetId: string | null = null;
        let pendingImageMsgId:   string | null = null;
        // Set when this attempt hands over to the silent PROVIDER_ERROR retry: the
        // stream is still live, so `finally` must not tear down the timer, the Stop
        // button or the typing indicator underneath it.
        let willRetry = false;

        try {
          const res = await fetch(`/api/chats/${chatId}/messages`, {
            method: 'POST', headers, body, signal: controller.signal,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            // Branch on the machine-readable code, never the copy — see web/CLAUDE.md.
            if (err.code === 'DUPLICATE_MESSAGE_ID') {
              // This exact turn already landed server-side on an earlier attempt (the
              // PROVIDER_ERROR retry raced a send that actually succeeded). There is
              // nothing to show the user and nothing to re-send — just resync the
              // transcript from the server's copy via the tag invalidation in `finally`.
              dispatch(resetStream());
              return;
            }
            dispatch(resetStream());
            reportError(err.code ?? 'SERVER_ERROR', err.message ?? err.detail, retryAfterSeconds(err));
            return;
          }

          // The send was accepted, so the account is spendable again.
          dispatch(setOutOfCredits(false));

          const reader  = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer    = '';
          let assistantContent  = '';
          let assistantThinking = '';

          while (true) {
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
                      chat_id: chatId!, role: 'assistant', content: assistantContent,
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
                        if (controller.signal.aborted) return;
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
          if (!willRetry) {
            clearInterval(timeoutId);
            dispatch(stopStream());
            abortRef.current = null;
            dispatch(chatApi.util.invalidateTags([{ type: 'Chat', id: chatId! }, 'Chat']));
            // Every turn now costs credits, so the cached balance is stale the
            // moment a stream ends. Nothing invalidated this tag before, which
            // left Settings/Billing showing a balance that never moved.
            dispatch(settingsApi.util.invalidateTags(['Credits']));
          }
          // else: the retry owns the stream (timer, Stop, indicator) from here.
        }

        // Poll for image result if an image-edit job was dispatched
        if (pendingImageAssetId && pendingImageMsgId) {
          pollImageAsset(pendingImageAssetId, pendingImageMsgId, token, dispatch);
        }
      };

      await doStream();
    },
    [token, activeChatId, selectedModel, dispatch, navigate],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    dispatch(resetStream());
  }, [dispatch]);

  return { sendMessage, stopGeneration };
}
