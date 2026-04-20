import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function ChatArea() {
  const messages    = useAppSelector((s) => s.chat.activeMessages);
  const isStreaming = useAppSelector((s) => s.streaming.isStreaming);
  const current     = useAppSelector((s) => s.streaming.currentContent);
  const thinking    = useAppSelector((s) => s.streaming.thinkingContent);
  const bottomRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, current]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto max-w-3xl">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}

        {isStreaming && (
          <TypingIndicator content={current} thinking={thinking} />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
