import { useId } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/authSlice';
import { showToast } from '../../../app/uiSlice';
import { useUpdateSettingsMutation as useUpdateProfileMutation } from '../settingsApi';
import type { User } from '../../../types/auth.types';

interface ToggleRowProps { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; }

function ToggleRow({ label, desc, checked, onChange }: ToggleRowProps) {
  const labelId = useId();
  const descId  = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-surface-3 last:border-0">
      <div>
        <p id={labelId} className="text-sm font-medium text-white">{label}</p>
        {desc && <p id={descId} className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={desc ? descId : undefined}
        onClick={() => onChange(!checked)}
        className={`h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potato-500 focus-visible:ring-offset-2 ${checked ? 'bg-potato-600' : 'bg-surface-3'}`}
      >
        <span className={`block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

type ToggleKey = 'lightweight_image_model' | 'show_token_count' | 'math_rendering';

/**
 * Only settings the app actually honours are shown (replica A03). Memory, Extended
 * thinking, Mermaid and Streaming had no effect anywhere, so they are hidden; their
 * stored keys and the API that accepts them are left alone so older clients keep working.
 */
export function AIPreferencesSection() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);
  const [update] = useUpdateProfileMutation();

  // Optimistic, with rollback: the switch must not claim a setting the server didn't save.
  const toggle = async (key: ToggleKey, val: boolean) => {
    const previous = user?.[key];
    dispatch(updateUser({ [key]: val } as Partial<User>));
    try {
      await update({ [key]: val }).unwrap();
    } catch {
      dispatch(updateUser({ [key]: previous } as Partial<User>));
      dispatch(showToast({ message: "Couldn't save that setting. Please try again.", type: 'error' }));
    }
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">AI Preferences</h2>
      <p className="mb-6 text-sm text-gray-400">Customise how AI models respond to you.</p>

      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <ToggleRow
          label="Lightweight model for images"
          desc="Reads image attachments with a low-cost model. Off, one image can cost ~40× more credits."
          checked={user.lightweight_image_model}
          onChange={(v) => toggle('lightweight_image_model', v)}
        />
        <ToggleRow
          label="Show token count"
          desc="Show how many tokens each reply used."
          checked={user.show_token_count === true}
          onChange={(v) => toggle('show_token_count', v)}
        />
        <ToggleRow
          label="Math rendering"
          desc="Typeset LaTeX maths. Off, the formula source is shown as plain text."
          checked={user.math_rendering !== false}
          onChange={(v) => toggle('math_rendering', v)}
        />
      </div>
    </div>
  );
}
