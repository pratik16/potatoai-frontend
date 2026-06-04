import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMeta } from '../../../types/chat.types';
import { MODEL_NAMES, MODEL_COLORS } from '../../../utils/modelConfig';
import { formatChatDate } from '../../../utils/formatDate';
import { Badge } from '../../../components/ui/Badge';
import { useUpdateChatMutation, useDeleteChatMutation } from '../../chat/chatApi';
import { projectsApi } from '../projectsApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setActiveChat, clearMessages } from '../../chat/chatSlice';
import { showToast } from '../../../app/uiSlice';

interface Props {
  chat: ChatMeta;
  projectId: string;
}

export function ProjectChatListItem({ chat, projectId }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);

  const chatId = chat.id ?? chat._id;
  const color = chat.model ? MODEL_COLORS[chat.model] ?? '#7c6af7' : '#7c6af7';
  const label = chat.model ? (MODEL_NAMES[chat.model] ?? chat.model.split('-')[0]) : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(chat.title || 'Untitled');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [updateChat] = useUpdateChatMutation();
  const [deleteChat] = useDeleteChatMutation();

  useEffect(() => {
    setTitle(chat.title || 'Untitled');
  }, [chat.title]);

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

  const invalidateProject = () => {
    dispatch(projectsApi.util.invalidateTags([{ type: 'Project', id: projectId }, 'Project']));
  };

  const handleRename = async () => {
    setRenaming(false);
    const trimmed = title.trim();
    if (!trimmed || trimmed === chat.title) {
      setTitle(chat.title || 'Untitled');
      return;
    }
    try {
      await updateChat({ id: chatId, title: trimmed }).unwrap();
      invalidateProject();
    } catch {
      dispatch(showToast({ message: 'Failed to rename chat', type: 'error' }));
      setTitle(chat.title || 'Untitled');
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this chat?')) return;
    try {
      await deleteChat(chatId).unwrap();
      invalidateProject();
      if (chatId === activeChatId) {
        dispatch(setActiveChat(null));
        dispatch(clearMessages());
        navigate(`/projects/${projectId}`, { replace: true });
      }
    } catch {
      dispatch(showToast({ message: 'Failed to delete chat', type: 'error' }));
    }
  };

  return (
    <div
      className={clsx(
        'group relative flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-sm transition-colors hover:border-surface-3 hover:bg-surface-2',
        renaming && 'border-surface-3 bg-surface-2',
      )}
    >
      {renaming ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setRenaming(false);
              setTitle(chat.title || 'Untitled');
            }
          }}
          className="min-w-0 flex-1 bg-transparent font-medium text-white focus:outline-none"
        />
      ) : (
        <Link
          to={`/chat/${chatId}`}
          className="min-w-0 flex-1 truncate font-medium text-gray-200"
        >
          {chat.title || 'Untitled'}
        </Link>
      )}

      <div className="ml-3 flex shrink-0 items-center gap-2">
        {!renaming && label && (
          <Badge style={{ backgroundColor: color + '22', color }}>{label.split(' ')[0]}</Badge>
        )}
        {!renaming && (
          <span className="text-xs text-gray-500">{formatChatDate(chat.last_message_at)}</span>
        )}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className={clsx(
              'rounded p-1 text-gray-500 hover:bg-surface-3 hover:text-white',
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 w-40 rounded-lg border border-surface-3 bg-surface-1 py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-surface-2"
              >
                <Pencil className="h-3 w-3" /> Rename
              </button>
              <div className="my-1 border-t border-surface-3" />
              <button
                type="button"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-surface-2"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
