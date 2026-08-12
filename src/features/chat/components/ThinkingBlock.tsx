import { useState } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import { clsx } from 'clsx';

export function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 rounded-2xl bg-surface-1 text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white"
      >
        <Brain className="h-3.5 w-3.5 text-potato-500" />
        <span className="font-medium">Thinking</span>
        <ChevronDown className={clsx('ml-auto h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 text-gray-400 leading-relaxed whitespace-pre-wrap">{content}</div>}
    </div>
  );
}
