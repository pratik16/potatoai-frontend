import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setSidebarOpen, setOnline } from '../../app/uiSlice';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../hooks/useTheme';

export function AppLayout() {
  useKeyboard();
  useTheme();

  const dispatch    = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const isOnline    = useAppSelector((s) => s.ui.isOnline);
  const toast       = useAppSelector((s) => s.ui.toast);

  useEffect(() => {
    const online  = () => dispatch(setOnline(true));
    const offline = () => dispatch(setOnline(false));
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0 text-white">
      {!isOnline && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-yellow-800 py-2 text-center text-xs text-yellow-100">
          You're offline. Reconnect to continue.
        </div>
      )}

      <Sidebar />

      {!sidebarOpen && (
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface-2 p-1 text-gray-400 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
