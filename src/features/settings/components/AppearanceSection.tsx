import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import { updateUser } from '../../auth/authSlice';
import { useUpdateSettingsMutation } from '../settingsApi';
import { THEME_MODES, type ThemeMode } from '../../../utils/theme';

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

  const mode = user.theme ?? 'dark';

  const save = async (patch: Partial<{ theme: ThemeMode }>) => {
    dispatch(updateUser(patch));
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
      </div>
    </div>
  );
}
