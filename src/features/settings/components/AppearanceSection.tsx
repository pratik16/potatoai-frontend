import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import { updateUser } from '../../auth/authSlice';
import { useUpdateSettingsMutation } from '../settingsApi';
import {
  UI_THEMES,
  THEME_MODES,
  UI_THEME_STORAGE_KEY,
  type UiTheme,
  type ThemeMode,
} from '../../../utils/theme';

function ThemeCard({
  id,
  name,
  description,
  preview,
  selected,
  onSelect,
}: {
  id: UiTheme;
  name: string;
  description: string;
  preview: { bg: string; surface: string; accent: string; text: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative flex flex-col overflow-hidden rounded-xl border text-left transition-all',
        selected
          ? 'border-potato-600 ring-2 ring-potato-600/40'
          : 'border-surface-3 hover:border-surface-4',
      )}
    >
      <div className="p-3" style={{ backgroundColor: preview.bg }}>
        <div
          className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-2"
          style={{ backgroundColor: preview.surface }}
        >
          <span className="text-sm font-medium" style={{ color: preview.text }}>
            {id === 'claude' ? 'Hello, how can I help?' : 'Who are you?'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-7 flex-1 rounded-md"
            style={{ backgroundColor: preview.surface, border: `1px solid ${preview.text}14` }}
          />
          <div
            className="h-7 w-7 rounded-md"
            style={{ backgroundColor: preview.accent }}
          />
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 border-t border-surface-3 bg-surface-1 p-3">
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
        {selected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-potato-600 text-white">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  );
}

function ModeButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'bg-potato-600 text-white'
          : 'bg-surface-2 text-gray-400 hover:bg-surface-3 hover:text-white',
      )}
    >
      {label}
    </button>
  );
}

export function AppearanceSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [update] = useUpdateSettingsMutation();

  if (!user) return null;

  const uiTheme = user.ui_theme ?? 'potato';
  const mode = user.theme ?? 'dark';

  const save = async (patch: Partial<{ ui_theme: UiTheme; theme: ThemeMode }>) => {
    dispatch(updateUser(patch));
    if (patch.ui_theme) {
      localStorage.setItem(UI_THEME_STORAGE_KEY, patch.ui_theme);
    }
    try {
      await update(patch).unwrap();
    } catch {
      dispatch(showToast({ message: 'Could not save appearance settings', type: 'error' }));
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Appearance</h2>
      <p className="mb-6 text-sm text-gray-400">Customise the look of PotatoChat.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <h3 className="mb-1 text-sm font-medium text-white">Color theme</h3>
          <p className="mb-4 text-xs text-gray-500">Choose a visual style for the app.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(UI_THEMES) as UiTheme[]).map((key) => {
              const t = UI_THEMES[key];
              return (
                <ThemeCard
                  key={t.id}
                  {...t}
                  selected={uiTheme === t.id}
                  onSelect={() => save({ ui_theme: t.id })}
                />
              );
            })}
          </div>
        </div>

        {uiTheme === 'potato' && (
          <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
            <h3 className="mb-1 text-sm font-medium text-white">Mode</h3>
            <p className="mb-4 text-xs text-gray-500">Dark, light, or match your system preference.</p>
            <div className="flex flex-wrap gap-2">
              {THEME_MODES.map((m) => (
                <ModeButton
                  key={m.id}
                  label={m.label}
                  selected={mode === m.id}
                  onClick={() => save({ theme: m.id })}
                />
              ))}
            </div>
          </div>
        )}

        {uiTheme === 'claude' && (
          <p className="text-xs text-gray-500">
            Claude theme uses a warm cream palette inspired by claude.ai. Mode is fixed to light for this theme.
          </p>
        )}
      </div>
    </div>
  );
}
