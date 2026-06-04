import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, Paperclip, X, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useChat } from '../../../hooks/useChat';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import { PromptLibraryPanel } from '../../prompts/PromptLibraryPanel';

const MAX_CHARS   = 4000;
const MAX_FILES   = 5;
const MAX_FILE_MB = 10;
const ALLOWED_TYPES = ['text/plain', 'application/pdf', 'text/markdown', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface MessageInputProps {
  /** When set, new chats are created inside this project (ChatGPT-style). */
  projectId?: string | null;
}

export function MessageInput({ projectId = null }: MessageInputProps) {
  const dispatch    = useAppDispatch();
  const [value, setValue]     = useState('');
  const [files, setFiles]     = useState<File[]>([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, stopGeneration } = useChat();
  const isStreaming  = useAppSelector((s) => s.streaming.isStreaming);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);

  // Restore draft
  useEffect(() => {
    const key = `draft_${activeChatId ?? 'new'}`;
    const saved = localStorage.getItem(key);
    if (saved) setValue(saved);
  }, [activeChatId]);

  // Save draft on change
  useEffect(() => {
    const key = `draft_${activeChatId ?? 'new'}`;
    if (value) localStorage.setItem(key, value);
    else       localStorage.removeItem(key);
  }, [value, activeChatId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    setValue('');
    setFiles([]);
    sendMessage(trimmed, projectId, files);
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const handleFiles = (selected: File[]) => {
    if (files.length + selected.length > MAX_FILES) {
      dispatch(showToast({ message: `Maximum ${MAX_FILES} files per message`, type: 'error' }));
      return;
    }
    for (const f of selected) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        dispatch(showToast({ message: `${f.name} exceeds ${MAX_FILE_MB}MB limit`, type: 'error' }));
        return;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        dispatch(showToast({ message: `${f.name}: unsupported file type`, type: 'error' }));
        return;
      }
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // Create blob preview URLs once per files change; revoke on cleanup
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  useEffect(() => {
    const urls = files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null));
    setPreviews(urls);
    return () => { urls.forEach((u) => u && URL.revokeObjectURL(u)); };
  }, [files]);

  return (
    <div className="border-t border-surface-3 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        {/* File previews */}
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative">
                {previews[i] ? (
                  <>
                    <img
                      src={previews[i]!}
                      alt={f.name}
                      className="h-16 w-16 rounded-lg border border-surface-3 object-cover"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-600"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-2 px-2 py-1 text-xs text-gray-300">
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative rounded-2xl border border-surface-3 bg-surface-2 focus-within:border-potato-500">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message PotatoChat..."
            rows={1}
            maxLength={MAX_CHARS}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-sm text-white placeholder-gray-500 focus:outline-none"
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
              className="text-gray-500 hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowPrompts((v) => !v)}
              title="Prompt library"
              className={clsx('hover:text-white', showPrompts ? 'text-potato-400' : 'text-gray-500')}
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={clsx('text-xs', value.length > MAX_CHARS * 0.9 ? 'text-yellow-400' : 'text-gray-600')}>
              {value.length}/{MAX_CHARS}
            </span>
            {isStreaming ? (
              <button onClick={stopGeneration} className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 text-white hover:bg-surface-4">
                <Square className="h-3.5 w-3.5 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-potato-600 text-white hover:bg-potato-700 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-gray-600">
          PotatoChat can make mistakes. Verify important information.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.md,.jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* Prompt library panel */}
      {showPrompts && (
        <div className="mx-auto mt-2 max-w-3xl">
          <PromptLibraryPanel
            onSelect={(content) => {
              setValue(content);
              setShowPrompts(false);
              textareaRef.current?.focus();
            }}
          />
        </div>
      )}
    </div>
  );
}
