import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setOnline } from '../../app/uiSlice';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../hooks/useTheme';

export function AppLayout() {
  useKeyboard();
  useTheme();

  const dispatch    = useAppDispatch();
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

      {/* The sidebar collapses to an icon rail rather than disappearing, so it
          no longer needs a floating button to bring it back. */}
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
