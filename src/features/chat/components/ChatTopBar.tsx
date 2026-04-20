import { Pencil, Share2, MoreHorizontal } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { CreditPill } from '../../../components/ui/CreditPill';

export function ChatTopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-surface-3 px-4 py-3">
      <h1 className="truncate text-sm font-medium text-white max-w-sm">{title}</h1>
      <div className="flex items-center gap-2">
        <ModelSelector />
        <button className="text-gray-500 hover:text-white"><Pencil className="h-4 w-4" /></button>
        <button className="text-gray-500 hover:text-white"><Share2 className="h-4 w-4" /></button>
        <button className="text-gray-500 hover:text-white"><MoreHorizontal className="h-4 w-4" /></button>
        <CreditPill />
      </div>
    </header>
  );
}
