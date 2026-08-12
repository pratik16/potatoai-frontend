import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { applyTheme, readStoredThemeMode, type ThemeMode, type UiTheme } from '../utils/theme';

export function useTheme() {
  const user = useAppSelector((s) => s.auth.user);
  // Potato is temporarily hidden from the appearance picker pending a redesign;
  // force Claude even for accounts with an old stored ui_theme of 'potato'.
  const uiTheme: UiTheme = 'claude';
  const mode: ThemeMode = user?.theme ?? readStoredThemeMode();

  useEffect(() => {
    applyTheme(uiTheme, mode);
  }, [uiTheme, mode]);

  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(uiTheme, 'system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode, uiTheme]);
}
