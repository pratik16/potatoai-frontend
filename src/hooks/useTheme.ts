import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import {
  applyTheme,
  readStoredThemeMode,
  readStoredUiTheme,
  type ThemeMode,
  type UiTheme,
} from '../utils/theme';

export function useTheme() {
  const user = useAppSelector((s) => s.auth.user);
  const uiTheme: UiTheme = user?.ui_theme ?? readStoredUiTheme();
  const mode: ThemeMode = user?.theme ?? readStoredThemeMode();

  useEffect(() => {
    applyTheme(uiTheme, mode);
  }, [uiTheme, mode]);

  useEffect(() => {
    if (mode !== 'system' || uiTheme === 'claude') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(uiTheme, 'system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode, uiTheme]);
}
