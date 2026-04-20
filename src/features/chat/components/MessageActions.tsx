import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { showToast } from '../../../app/uiSlice';
import { useAppDispatch } from '../../../app/hooks';
import type { Message } from '../../../types/chat.types';

export function MessageActions({ message }: { message: Message }) {
  const dispatch = useAppDispatch();

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    dispatch(showToast({ message: 'Copied to clipboard', type: 'success' }));
  };

  return (
    <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button onClick={copy} className="rounded p-1 text-gray-500 hover:bg-surface-2 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
      <button className="rounded p-1 text-gray-500 hover:bg-surface-2 hover:text-white"><ThumbsUp className="h-3.5 w-3.5" /></button>
      <button className="rounded p-1 text-gray-500 hover:bg-surface-2 hover:text-white"><ThumbsDown className="h-3.5 w-3.5" /></button>
      <button className="rounded p-1 text-gray-500 hover:bg-surface-2 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /></button>
      {(message.output_tokens ?? 0) > 0 && (
        <span className="ml-2 text-xs text-gray-600">{message.output_tokens} tokens</span>
      )}
    </div>
  );
}
