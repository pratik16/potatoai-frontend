import { useState } from 'react';
import { Pin, Trash2, Plus, Search } from 'lucide-react';
import { useGetPromptsQuery, useCreatePromptMutation, useDeletePromptMutation, useTogglePinMutation } from './promptsApi';

export function PromptLibraryPanel({ onSelect }: { onSelect: (content: string) => void }) {
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ title: '', content: '' });

  const { data: prompts = [] }     = useGetPromptsQuery({ pinned_first: true });
  const [createPrompt, { isLoading: isCreating }] = useCreatePromptMutation();
  const [deletePrompt] = useDeletePromptMutation();
  const [togglePin]    = useTogglePinMutation();

  const filtered = prompts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createPrompt(form);
    setForm({ title: '', content: '' });
    setShowAdd(false);
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-surface-2 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-potato-600 px-2 py-1.5 text-xs text-white hover:bg-potato-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 space-y-2 rounded-lg border border-surface-3 bg-surface-2 p-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <textarea
            placeholder="Prompt content..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={3}
            className="w-full resize-none bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="rounded bg-potato-600 px-2 py-1 text-xs text-white hover:bg-potato-700 disabled:opacity-50"
            >
              Save
            </button>
            <button onClick={() => setShowAdd(false)} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-600">
            {prompts.length === 0 ? 'No prompts yet. Add one above.' : 'No matching prompts.'}
          </p>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group flex items-start justify-between gap-2 rounded-lg p-2 hover:bg-surface-2"
          >
            <button
              className="flex-1 text-left"
              onClick={() => onSelect(p.content)}
            >
              <p className="text-xs font-medium text-white">{p.title}</p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{p.content.slice(0, 80)}</p>
            </button>
            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
              <button onClick={() => togglePin(p.id)} className={p.is_pinned ? 'text-yellow-400' : 'text-gray-500 hover:text-white'}>
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deletePrompt(p.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
