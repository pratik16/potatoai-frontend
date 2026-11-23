import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { MessageBubble } from './MessageBubble';
import type { RegenerateTarget } from './MessageActions';
import { TypingIndicator } from './TypingIndicator';
import { Spinner } from '../../../components/ui/Spinner';
import { useLazyGetChatQuery } from '../chatApi';
import { prependMessages } from '../chatSlice';
import { showToast } from '../../../app/uiSlice';

const PAGE_SIZE = 50;
// Fetch the next page a little before the user hits the physical top, so
// there's no visible stall while the request is in flight.
const LOAD_MORE_THRESHOLD_PX = 200;

export function ChatArea() {
  const { chatId }   = useParams<{ chatId: string }>();
  const dispatch      = useAppDispatch();
  const messages       = useAppSelector((s) => s.chat.activeMessages);
  const hasMoreMessages = useAppSelector((s) => s.chat.hasMoreMessages);
  const isStreaming    = useAppSelector((s) => s.streaming.isStreaming);
  const current         = useAppSelector((s) => s.streaming.currentContent);
  const thinking         = useAppSelector((s) => s.streaming.thinkingContent);

  // Per row: the user message a reply answers (the regenerate PATCH target) and how
  // many messages follow the reply. Recomputed only when the transcript changes, not
  // per streamed token, so the memoised bubbles keep stable props.
  const regenerateTargets = useMemo(() => {
    const targets: (RegenerateTarget | null)[] = [];
    let lastUser: (typeof messages)[number] | null = null;
    messages.forEach((m, i) => {
      if (m.role === 'user') {
        lastUser = m;
        targets.push(null);
        return;
      }
      targets.push(lastUser ? {
        userMessageId: lastUser._id ?? lastUser.id,
        userContent:   lastUser.content,
        laterCount:    messages.length - 1 - i,
      } : null);
    });
    return targets;
  }, [messages]);

  const parentRef = useRef<HTMLDivElement>(null);
  const [triggerGetChat, { isFetching: isLoadingOlder }] = useLazyGetChatQuery();

  // Set right before a "load older" request is fired, consumed in the layout
  // effect below once the prepended messages have grown the DOM — that's what
  // lets us restore the exact same reading position instead of the browser
  // jumping the user to whatever is now at scrollTop:0.
  const pendingAnchorRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null);
  const prevCountRef = useRef(0);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 6,
    getItemKey: (index) => messages[index]?._id ?? messages[index]?.id ?? index,
  });

  const loadOlder = useCallback(() => {
    const el = parentRef.current;
    if (!chatId || !hasMoreMessages || isLoadingOlder || messages.length === 0 || !el) return;

    const oldest = messages[0];
    const beforeId = oldest._id ?? oldest.id;
    if (!beforeId) return;

    pendingAnchorRef.current = { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight };

    triggerGetChat({ id: chatId, before_id: beforeId, limit: PAGE_SIZE })
      .unwrap()
      .then((res) => {
        dispatch(prependMessages({ messages: res.messages, has_more: res.has_more }));
      })
      .catch(() => {
        pendingAnchorRef.current = null;
        dispatch(showToast({ message: 'Failed to load older messages', type: 'error' }));
      });
  }, [chatId, hasMoreMessages, isLoadingOlder, messages, triggerGetChat, dispatch]);

  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (el && el.scrollTop < LOAD_MORE_THRESHOLD_PX) loadOlder();
  }, [loadOlder]);

  // Reconciles the transcript growing for one of two reasons:
  //  - an older page was prepended above the viewport -> hold the reading position
  //  - initial load / a new message appended at the tail -> jump/scroll to the latest
  useLayoutEffect(() => {
    const el = parentRef.current;
    const prevCount = prevCountRef.current;
    prevCountRef.current = messages.length;
    if (!el || messages.length === 0 || messages.length === prevCount) return;

    if (pendingAnchorRef.current) {
      const { scrollTop, scrollHeight } = pendingAnchorRef.current;
      pendingAnchorRef.current = null;
      el.scrollTop = scrollTop + (el.scrollHeight - scrollHeight);
      return;
    }

    rowVirtualizer.scrollToIndex(messages.length - 1, {
      align: 'end',
      behavior: prevCount === 0 ? 'auto' : 'smooth',
    });
  }, [messages.length, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 [overflow-anchor:none]"
    >
      <div className="mx-auto max-w-3xl">
        {isLoadingOlder && (
          <div className="flex justify-center py-3">
            <Spinner className="h-5 w-5" />
          </div>
        )}

        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const msg = messages[virtualRow.index];
            if (!msg) return null;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageBubble message={msg} regenerate={regenerateTargets[virtualRow.index]} />
              </div>
            );
          })}
        </div>

        {isStreaming && (
          <TypingIndicator content={current} thinking={thinking} />
        )}
      </div>
    </div>
  );
}
