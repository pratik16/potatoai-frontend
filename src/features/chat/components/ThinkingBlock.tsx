import { useState } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import { clsx } from 'clsx';

export function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2 rounded-lg border border-surface-3 bg-surface-2 text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-gray-400 hover:text-white"
      >
        <Brain className="h-3.5 w-3.5 text-purple-400" />
        <span className="font-medium">Thinking</span>
        <ChevronDown className={clsx('ml-auto h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-surface-3 px-3 pb-3 pt-2 text-gray-400 leading-relaxed whitespace-pre-wrap">{content}</div>}
    </div>
  );
}
