import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/authSlice';
import { useUpdateSettingsMutation as useUpdateProfileMutation } from '../settingsApi';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';

export function ProfileSection() {
  const dispatch    = useAppDispatch();
  const user        = useAppSelector((s) => s.auth.user);
  const [update, { isLoading }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email:     user?.email ?? '',
    timezone:  user?.timezone ?? 'UTC',
  });

  const handleSave = async () => {
    const result = await update(form).unwrap();
    dispatch(updateUser(result));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Profile settings</h2>
      <p className="mb-6 text-sm text-gray-400">Manage your personal information and preferences.</p>

      <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
        <h3 className="mb-4 font-medium text-white">Personal information</h3>

        <div className="mb-4 flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.full_name ?? user?.username} size="lg" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Upload photo</Button>
            <Button size="sm" variant="ghost">Remove</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="Pratik Vanol"
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} loading={isLoading}>Save changes</Button>
      </div>
    </div>
  );
}
