import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/authSlice';
import { useUpdateSettingsMutation as useUpdateProfileMutation } from '../settingsApi';

interface ToggleRowProps { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; }

function ToggleRow({ label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-potato-600' : 'bg-surface-3'}`}
      >
        <span className={`block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

export function AIPreferencesSection() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);
  const [update] = useUpdateProfileMutation();

  const toggle = async (key: string, val: boolean) => {
    dispatch(updateUser({ [key]: val }));
    await update({ [key]: val });
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">AI Preferences</h2>
      <p className="mb-6 text-sm text-gray-400">Customise how AI models respond to you.</p>

      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <ToggleRow label="Streaming" desc="Show responses as they're generated" checked={user.streaming_enabled}  onChange={(v) => toggle('streaming_enabled', v)} />
        <ToggleRow label="Show token count"                                       checked={user.show_token_count}   onChange={(v) => toggle('show_token_count', v)} />
        <ToggleRow label="Memory" desc="Remember facts across conversations"      checked={user.memory_enabled}     onChange={(v) => toggle('memory_enabled', v)} />
        <ToggleRow label="Extended thinking (Claude)"                              checked={user.thinking_enabled}   onChange={(v) => toggle('thinking_enabled', v)} />
        <ToggleRow label="Math rendering (KaTeX)"                                  checked={user.math_rendering}     onChange={(v) => toggle('math_rendering', v)} />
        <ToggleRow label="Diagram rendering (Mermaid)"                             checked={user.diagram_rendering}  onChange={(v) => toggle('diagram_rendering', v)} />
      </div>
    </div>
  );
}
