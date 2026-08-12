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

  // Responses no longer carry an avatar or model badge, so this row is the only
  // thing marking one as the assistant's — keep it faintly visible rather than
  // fully hidden until hover.
  return (
    <div className="mt-2 flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
      <button onClick={copy} className="rounded-full p-2 text-gray-500 hover:bg-surface-2 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
      <button className="rounded-full p-2 text-gray-500 hover:bg-surface-2 hover:text-white"><ThumbsUp className="h-3.5 w-3.5" /></button>
      <button className="rounded-full p-2 text-gray-500 hover:bg-surface-2 hover:text-white"><ThumbsDown className="h-3.5 w-3.5" /></button>
      <button className="rounded-full p-2 text-gray-500 hover:bg-surface-2 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /></button>
      {(message.output_tokens ?? 0) > 0 && (
        <span className="ml-2 text-xs text-gray-600">{message.output_tokens} tokens</span>
      )}
    </div>
  );
}
