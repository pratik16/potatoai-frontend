import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, PanelLeft, Star, FolderKanban, Settings, BarChart2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setSidebarOpen } from '../../app/uiSlice';
import { useGetChatsQuery } from '../../features/chat/chatApi';
import { ProjectSidebarSection } from '../../features/projects/components/ProjectSidebarSection';
import { BrandMark, BrandLogo } from '../BrandLogo';
import { Avatar } from '../ui/Avatar';
import { SidebarChatItem } from './SidebarChatItem';
import { SidebarFooter } from './SidebarFooter';

const RAIL_W = 'w-[68px]';
const FULL_W = 'w-64';

/** Icon-only control for the collapsed rail. */
function RailButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        active ? 'bg-surface-2 text-white' : 'text-gray-400 hover:bg-surface-2 hover:text-white',
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function Sidebar() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const dispatch     = useAppDispatch();
  const pinned       = useAppSelector((s) => s.ui.sidebarOpen);
  const user         = useAppSelector((s) => s.auth.user);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Unpinned, the panel expands on hover and floats over the content rather
  // than pushing it — the same way Gemini's rail behaves.
  const expanded = pinned || hovered;

  const { data: allChats = [] } = useGetChatsQuery();

  const chats = useMemo(() => {
    const unscoped = allChats.filter((c) => !c.project_id);
    if (!search.trim()) return unscoped;
    return unscoped.filter((c) => (c.title || '').toLowerCase().includes(search.toLowerCase()));
  }, [allChats, search]);

  const starred   = chats.filter((c) => c.starred);
  const today     = chats.filter((c) => !c.starred && c.last_message_at && isToday(c.last_message_at));
  const yesterday = chats.filter((c) => !c.starred && c.last_message_at && isYesterday(c.last_message_at));
  const older     = chats.filter((c) => !c.starred && (!c.last_message_at || (!isToday(c.last_message_at) && !isYesterday(c.last_message_at))));

  const expandAndFocusSearch = () => {
    dispatch(setSidebarOpen(true));
    window.setTimeout(() => searchRef.current?.focus(), 220);
  };

  return (
    /* Spacer holds the rail's footprint so the floating panel never shifts content. */
    <div className={clsx('relative h-full shrink-0 transition-all duration-200', pinned ? FULL_W : RAIL_W)}>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          'absolute inset-y-0 left-0 z-30 flex h-full min-h-0 flex-col bg-surface-0 transition-all duration-200',
          expanded ? FULL_W : RAIL_W,
          !pinned && hovered && 'shadow-2xl',
        )}
      >
        {expanded ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <Link to="/" className="flex items-center gap-2">
                <BrandLogo size="sm" />
              </Link>
              <button
                onClick={() => dispatch(setSidebarOpen(!pinned))}
                title={pinned ? 'Collapse sidebar' : 'Keep sidebar open'}
                aria-label={pinned ? 'Collapse sidebar' : 'Keep sidebar open'}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-surface-2 hover:text-white"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>

            {/* New chat */}
            <div className="shrink-0 px-2 pb-2">
              <Link to="/chat/new" className="flex w-full items-center gap-2 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-surface-3">
                <Plus className="h-4 w-4" /> New chat
              </Link>
            </div>

            {/* Projects */}
            <div className="shrink-0 px-2 pb-2">
              <Link
                to="/projects"
                className={clsx(
                  'flex w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  location.pathname.startsWith('/projects')
                    ? 'bg-surface-2 text-white'
                    : 'text-gray-300 hover:bg-surface-2 hover:text-white',
                )}
              >
                <FolderKanban className="h-4 w-4 shrink-0" />
                Projects
              </Link>
              <ProjectSidebarSection />
            </div>

            {/* Search */}
            <div className="shrink-0 px-2 pb-2">
              <div className="flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm text-gray-500">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2">
              {starred.length > 0 && (
                <>
                  <p className="mb-1 mt-2 flex items-center gap-1 px-3 text-xs font-medium text-gray-500">
                    <Star className="h-3 w-3" /> Starred
                  </p>
                  {starred.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
                </>
              )}
              {today.length > 0 && (
                <>
                  <p className="mb-1 mt-2 px-3 text-xs font-medium text-gray-500">Today</p>
                  {today.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
                </>
              )}
              {yesterday.length > 0 && (
                <>
                  <p className="mb-1 mt-2 px-3 text-xs font-medium text-gray-500">Yesterday</p>
                  {yesterday.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
                </>
              )}
              {older.length > 0 && (
                <>
                  <p className="mb-1 mt-2 px-3 text-xs font-medium text-gray-500">Older</p>
                  {older.map((c) => <SidebarChatItem key={c.id ?? c._id} chat={c} active={(c.id ?? c._id) === activeChatId} />)}
                </>
              )}
              {chats.length === 0 && search && (
                <p className="mt-4 px-3 text-xs text-gray-500">No chats matching "{search}"</p>
              )}
            </div>

            <SidebarFooter user={user} />
          </>
        ) : (
          /* Collapsed rail — icons only, same background as the page. */
          <>
            <div className="flex flex-col items-center gap-1 py-3">
              <Link to="/" className="mb-2 flex h-10 w-10 items-center justify-center" title="PotatoChat">
                <BrandMark size="sm" />
              </Link>
              <RailButton icon={Plus} label="New chat" onClick={() => navigate('/chat/new')} />
              <RailButton icon={Search} label="Search chats" onClick={expandAndFocusSearch} />
              <RailButton
                icon={FolderKanban}
                label="Projects"
                active={location.pathname.startsWith('/projects')}
                onClick={() => navigate('/projects')}
              />
            </div>

            <div className="mt-auto flex flex-col items-center gap-1 py-3">
              <RailButton icon={BarChart2} label="Usage & credits" onClick={() => navigate('/usage')} />
              <RailButton icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
              {user && (
                <div className="mt-1" title={user.full_name ?? user.username ?? undefined}>
                  <Avatar src={user.avatar_url} name={user.full_name ?? user.username} size="sm" />
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}
function isYesterday(dateStr: string): boolean {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return new Date(dateStr).toDateString() === y.toDateString();
}
