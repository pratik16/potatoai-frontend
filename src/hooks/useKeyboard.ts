import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { toggleKeyboardShortcuts, toggleSidebar } from '../app/uiSlice';
import { useNavigate } from 'react-router-dom';

export function useKeyboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'k') { e.preventDefault(); navigate('/chat/new'); }
      if (mod && e.shiftKey && e.key === 'S') { e.preventDefault(); dispatch(toggleSidebar()); }
      if (mod && e.key === '/') { e.preventDefault(); dispatch(toggleKeyboardShortcuts()); }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, navigate]);
}
