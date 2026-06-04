export type UiTheme = 'potato' | 'claude';
export type ThemeMode = 'dark' | 'light' | 'system';

export const UI_THEMES: Record<UiTheme, {
  id: UiTheme;
  name: string;
  description: string;
  preview: { bg: string; surface: string; accent: string; text: string };
}> = {
  potato: {
    id: 'potato',
    name: 'Potato',
    description: 'Dark purple — the classic PotatoChat look.',
    preview: { bg: '#0d0d0d', surface: '#1f1f1f', accent: '#7c3aed', text: '#ffffff' },
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    description: 'Warm cream and terracotta — inspired by Claude.ai.',
    preview: { bg: '#faf9f5', surface: '#efe9de', accent: '#c96442', text: '#141413' },
  },
};

export const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: 'dark',   label: 'Dark' },
  { id: 'light',  label: 'Light' },
  { id: 'system', label: 'System' },
];

export const UI_THEME_STORAGE_KEY = 'potatochat_ui_theme';

export function resolveThemeMode(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function readStoredUiTheme(): UiTheme {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') ?? 'null') as { user?: { ui_theme?: UiTheme } } | null;
    const fromUser = auth?.user?.ui_theme;
    if (fromUser === 'potato' || fromUser === 'claude') return fromUser;

    const stored = localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (stored === 'potato' || stored === 'claude') return stored;
  } catch {
    /* ignore */
  }
  return 'potato';
}

export function readStoredThemeMode(): ThemeMode {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') ?? 'null') as { user?: { theme?: ThemeMode } } | null;
    const fromUser = auth?.user?.theme;
    if (fromUser === 'dark' || fromUser === 'light' || fromUser === 'system') return fromUser;
  } catch {
    /* ignore */
  }
  return 'dark';
}

/** Apply color scheme + light/dark mode to <html>. */
export function applyTheme(uiTheme: UiTheme, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.colorScheme = uiTheme;

  if (uiTheme === 'claude') {
    root.classList.remove('dark');
    root.dataset.theme = 'claude';
    return;
  }

  const resolved = resolveThemeMode(mode);
  root.dataset.theme = resolved;
  root.classList.toggle('dark', resolved === 'dark');
}
