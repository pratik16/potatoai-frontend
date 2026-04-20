import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useResetPasswordMutation } from '../features/auth/authApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ResetPasswordPage() {
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [form, setForm]   = useState({
    email:                 searchParams.get('email') ?? '',
    password:              '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');

  const token = searchParams.get('token') ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    try {
      await resetPassword({ token, ...form }).unwrap();
      navigate('/login');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      const firstError = e.data?.errors ? Object.values(e.data.errors)[0]?.[0] : undefined;
      setError(firstError ?? e.data?.message ?? 'Reset failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-2xl">🥔</span>
          <span className="text-lg font-semibold text-white">PotatoChat</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-white">Set new password</h1>
        <p className="mb-8 text-sm text-gray-400">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
          <Input
            id="password"
            type="password"
            label="New password"
            placeholder="••••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />
          <Input
            id="password_confirmation"
            type="password"
            label="Confirm new password"
            placeholder="••••••••••"
            value={form.password_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" loading={isLoading} size="lg" className="w-full">
            Reset password →
          </Button>
          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-potato-500 hover:text-potato-400">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
