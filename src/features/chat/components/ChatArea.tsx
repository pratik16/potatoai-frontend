import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function ChatArea() {
  const messages    = useAppSelector((s) => s.chat.activeMessages);
  const isStreaming = useAppSelector((s) => s.streaming.isStreaming);
  const current     = useAppSelector((s) => s.streaming.currentContent);
  const thinking    = useAppSelector((s) => s.streaming.thinkingContent);
  const status      = useAppSelector((s) => s.streaming.pipelineStatus);
  const sources     = useAppSelector((s) => s.streaming.streamedSources);
  const bottomRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, current, status, sources.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 [overflow-anchor:none]">
      {/* pb clears the composer, which now floats over this scroll area. */}
      <div className="mx-auto max-w-[720px] pb-44">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}

        {isStreaming && (
          <TypingIndicator content={current} thinking={thinking} status={status} sources={sources} />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
