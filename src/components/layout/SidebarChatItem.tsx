import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Star, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMeta } from '../../types/chat.types';
import { MODEL_COLORS } from '../../utils/modelConfig';
import { useUpdateChatMutation, useDeleteChatMutation, useToggleStarMutation } from '../../features/chat/chatApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setActiveChat, clearMessages } from '../../features/chat/chatSlice';
import { showToast } from '../../app/uiSlice';

interface Props { chat: ChatMeta; active: boolean; }

export function SidebarChatItem({ chat, active }: Props) {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const color       = MODEL_COLORS[chat.model ?? ''] ?? '#8b5cf6';

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [renaming,   setRenaming]   = useState(false);
  const [title,      setTitle]      = useState(chat.title || 'New chat');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [updateChat]  = useUpdateChatMutation();
  const [deleteChat]  = useDeleteChatMutation();
  const [toggleStar]  = useToggleStarMutation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const handleRename = async () => {
    setRenaming(false);
    if (title.trim() && title !== chat.title) {
      try {
        await updateChat({ id: chat.id ?? chat._id, title: title.trim() }).unwrap();
      } catch {
        dispatch(showToast({ message: 'Failed to rename chat', type: 'error' }));
        setTitle(chat.title || 'New chat');
      }
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this chat?')) return;
    try {
      await deleteChat(chat.id ?? chat._id).unwrap();
      if ((chat.id ?? chat._id) === activeChatId) {
        dispatch(setActiveChat(null));
        dispatch(clearMessages());
        navigate('/chat/new', { replace: true });
      }
    } catch {
      dispatch(showToast({ message: 'Failed to delete chat', type: 'error' }));
    }
  };

  const handleStar = async () => {
    setMenuOpen(false);
    await toggleStar(chat.id ?? chat._id);
  };

  const chatId = chat.id ?? chat._id;

  return (
    <div className={clsx('group relative flex items-center rounded-lg transition-colors', active ? 'bg-surface-3' : 'hover:bg-surface-2')}>
      {renaming ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setTitle(chat.title || 'New chat'); } }}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white focus:outline-none"
        />
      ) : (
        <Link
          to={`/chat/${chatId}`}
          className="flex flex-1 min-w-0 items-center gap-1.5 px-2 py-1.5 text-sm"
        >
          {chat.starred && <Star className="h-3 w-3 shrink-0 text-yellow-400 fill-yellow-400" />}
          <span className={clsx('truncate', active ? 'text-white' : 'text-gray-400 group-hover:text-white')}>
            {chat.title || 'New chat'}
          </span>
        </Link>
      )}

      <div ref={menuRef} className="relative mr-1 shrink-0">
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen((o) => !o); }}
          className={clsx(
            'rounded p-1 text-gray-600 hover:text-white',
            menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-7 z-50 w-40 rounded-lg border border-surface-3 bg-surface-1 py-1 shadow-xl">
            <button
              onClick={() => { setMenuOpen(false); setRenaming(true); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-surface-2"
            >
              <Pencil className="h-3 w-3" /> Rename
            </button>
            <button
              onClick={handleStar}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-surface-2"
            >
              <Star className="h-3 w-3" /> {chat.starred ? 'Unstar' : 'Star'}
            </button>
            <div className="my-1 border-t border-surface-3" />
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-surface-2"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}
