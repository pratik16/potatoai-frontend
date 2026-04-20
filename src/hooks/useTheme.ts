import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';

export function useTheme() {
  const theme = useAppSelector((s) => s.auth.user?.theme ?? 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
