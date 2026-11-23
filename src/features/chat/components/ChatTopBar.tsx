import { Pencil, Share2, MoreHorizontal } from 'lucide-react';
import { CreditPill } from '../../../components/ui/CreditPill';

export function ChatTopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-surface-3 px-4 py-3">
      <h1 className="truncate text-sm font-medium text-white max-w-sm">{title}</h1>
      <div className="flex items-center gap-2">
        {/* Not wired yet (no handlers): labelled so screen readers don't hit nameless buttons. */}
        <button type="button" aria-label="Rename chat" title="Rename chat" className="rounded text-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" aria-label="Share chat" title="Share chat" className="rounded text-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500"><Share2 className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" aria-label="More chat options" title="More chat options" className="rounded text-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500"><MoreHorizontal className="h-4 w-4" aria-hidden="true" /></button>
        <CreditPill />
      </div>
    </header>
  );
}
