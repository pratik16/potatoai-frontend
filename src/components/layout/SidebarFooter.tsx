import { useNavigate } from 'react-router-dom';
import { Settings, BarChart2, LogOut } from 'lucide-react';
import type { User } from '../../types/auth.types';
import { Avatar } from '../ui/Avatar';
import { useLogoutMutation } from '../../features/auth/authApi';
import { clearCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../app/hooks';

export function SidebarFooter({ user }: { user: User | null }) {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [logout]  = useLogoutMutation();

  const handleLogout = async () => {
    try { await logout().unwrap(); } catch { /* ignore */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <div className="border-t border-surface-3 p-2">
      <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-surface-2 hover:text-white">
        <Settings className="h-4 w-4" /> Settings
      </a>
      <a href="/usage" onClick={(e) => { e.preventDefault(); navigate('/usage'); }} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-surface-2 hover:text-white">
        <BarChart2 className="h-4 w-4" /> Usage &amp; credits
      </a>
      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-surface-2 hover:text-white">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
      {user && (
        <div className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2">
          <Avatar src={user.avatar_url} name={user.full_name ?? user.username} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user.full_name ?? user.username ?? user.name}</p>
            <p className="truncate text-xs uppercase text-gray-500">
              {user.plan !== 'free' ? `${user.plan.toUpperCase()} PLAN` : 'FREE PLAN'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
