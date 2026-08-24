import { useEffect, useLayoutEffect } from 'react';
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

  // Deliberately NOT useDocumentTitle (plain useEffect) here: React fires child
  // effects before parent effects on mount, so when a page (child of AppLayout)
  // and AppLayout mount together in the same commit - e.g. right after login, or
  // a hard reload straight into an authenticated route - a plain useEffect default
  // here would run *after* the page's own useDocumentTitle and clobber it back to
  // the generic title. useLayoutEffect runs in the layout phase, which completes
  // (for the whole tree, parent included) strictly before any passive useEffect
  // fires, so this default always applies first and the page's useDocumentTitle
  // (a passive effect) reliably overrides it. Verified in the browser: without
  // this, /chat/new right after login was stuck showing the AppLayout default
  // instead of the page's title.
  useLayoutEffect(() => {
    document.title = 'PotatoAIHub | PotatoChat';
  }, []);

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
