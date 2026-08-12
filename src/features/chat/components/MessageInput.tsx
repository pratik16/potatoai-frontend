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
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-0 via-surface-0 to-transparent px-4 pb-3 pt-8">
      <div className="mx-auto max-w-[720px]">
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
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-600"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-gray-300">
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

        {/* One 64px row — controls sit inline with the text, which is what
            makes Gemini's composer read as a pill rather than a box. It only
            grows taller once the textarea itself wraps past a single line. */}
        <div className="flex min-h-[64px] items-center gap-2 rounded-[32px] bg-surface-2 px-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.16)] transition-colors focus-within:bg-surface-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-surface-3 hover:text-white"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message PotatoChat..."
            rows={1}
            maxLength={MAX_CHARS}
            className="my-4 max-h-48 flex-1 resize-none bg-transparent text-[17px] leading-6 text-white placeholder-gray-500 focus:outline-none"
          />

          {value.length > MAX_CHARS * 0.75 && (
            <span className={clsx('shrink-0 text-xs', value.length > MAX_CHARS * 0.9 ? 'text-yellow-400' : 'text-gray-500')}>
              {value.length}/{MAX_CHARS}
            </span>
          )}

          <button
            onClick={() => setShowPrompts((v) => !v)}
            title="Prompt library"
            className={clsx(
              // Hidden on narrow viewports — four inline controls leave the
              // textarea almost no room, and this is the least-used of them.
              'hidden h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-3 hover:text-white sm:flex',
              showPrompts ? 'text-potato-500' : 'text-gray-400',
            )}
          >
            <BookOpen className="h-5 w-5" />
          </button>

          {isStreaming ? (
            <button onClick={stopGeneration} title="Stop" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-4 text-white hover:bg-surface-3">
              <Square className="h-3.5 w-3.5 fill-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              title="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-surface-3 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
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
        <div className="mx-auto mt-2 max-w-[720px]">
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
