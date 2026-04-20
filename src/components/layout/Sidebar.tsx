import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setSidebarOpen } from '../../app/uiSlice';
import { useGetChatsQuery } from '../../features/chat/chatApi';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';
import { SidebarChatItem } from './SidebarChatItem';
import { SidebarFooter } from './SidebarFooter';
import { Badge } from '../ui/Badge';

export function Sidebar() {
  const dispatch     = useAppDispatch();
  const open         = useAppSelector((s) => s.ui.sidebarOpen);
  const user         = useAppSelector((s) => s.auth.user);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const [search, setSearch] = useState('');

  const { data: allChats  = [] } = useGetChatsQuery();
  const { data: projects  = [] } = useGetProjectsQuery();

  const chats = useMemo(() => {
    if (!search.trim()) return allChats;
    return allChats.filter((c) => (c.title || '').toLowerCase().includes(search.toLowerCase()));
  }, [allChats, search]);

  const starred   = chats.filter((c) => c.starred);
  const today     = chats.filter((c) => !c.starred && c.last_message_at && isToday(c.last_message_at));
  const yesterday = chats.filter((c) => !c.starred && c.last_message_at && isYesterday(c.last_message_at));
  const older     = chats.filter((c) => !c.starred && (!c.last_message_at || (!isToday(c.last_message_at) && !isYesterday(c.last_message_at))));

  return (
    <aside className={clsx(
      'flex h-full flex-col border-r border-surface-3 bg-surface-1 transition-all duration-200',
      open ? 'w-64' : 'w-0 overflow-hidden border-0',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg">🥔</span>
          <span className="font-semibold text-white">PotatoChat</span>
        </Link>
        <button onClick={() => dispatch(setSidebarOpen(false))} className="text-gray-500 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2 pb-2">
        <Link to="/chat/new" className="flex w-full items-center gap-2 rounded-lg bg-potato-600 px-3 py-2 text-sm font-medium text-white hover:bg-potato-700">
          <Plus className="h-4 w-4" /> New chat
        </Link>
      </div>

      {/* Search */}
      <div className="px-2 pb-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm text-gray-500">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-2 pb-1">
          <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Projects</p>
          {projects.map((p) => (
            <Link
              key={p.id ?? p._id}
              to={`/projects/${p.id ?? p._id}`}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-400 hover:bg-surface-2 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <span>{p.emoji}</span>
                <span className="truncate">{p.name}</span>
              </span>
              <Badge className="bg-surface-3 text-gray-500">{p.chat_count}</Badge>
            </Link>
          ))}
          <Link to="/projects" className="mt-1 flex w-full items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-400">
            <Plus className="h-3 w-3" /> New project
          </Link>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2">
        {starred.length > 0 && (
          <>
            <p className="mb-1 mt-2 flex items-center gap-1 px-1 text-xs font-semibold uppercase tracking-widest text-gray-600">
              <Star className="h-3 w-3" /> Starred
            </p>
            {starred.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
          </>
        )}
        {today.length > 0 && (
          <>
            <p className="mb-1 mt-2 px-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Today</p>
            {today.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
          </>
        )}
        {yesterday.length > 0 && (
          <>
            <p className="mb-1 mt-2 px-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Yesterday</p>
            {yesterday.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
          </>
        )}
        {older.length > 0 && (
          <>
            <p className="mb-1 mt-2 px-1 text-xs font-semibold uppercase tracking-widest text-gray-600">Older</p>
            {older.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
          </>
        )}
        {chats.length === 0 && search && (
          <p className="mt-4 px-2 text-xs text-gray-600">No chats matching "{search}"</p>
        )}
      </div>

      <SidebarFooter user={user} />
    </aside>
  );
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}
function isYesterday(dateStr: string): boolean {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return new Date(dateStr).toDateString() === y.toDateString();
}
