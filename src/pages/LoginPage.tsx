import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { BrandLogo } from '../components/BrandLogo';
import { MODELS } from '../utils/modelConfig';

export default function LoginPage() {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session_expired') === '1';
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm]   = useState({ email: '', password: '', remember_me: false });
  const [error, setError] = useState(sessionExpired ? 'Your session has expired. Please log in again.' : '');

  useEffect(() => {
    if (sessionExpired) {
      navigate('/login', { replace: true });
    }
  }, [navigate, sessionExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form).unwrap();
      dispatch(setCredentials(result));
      navigate('/chat/new');
    } catch (err: unknown) {
      const anyErr = err as { status?: number; data?: { code?: string; message?: string; detail?: string } };
      const message = anyErr.data?.message ?? anyErr.data?.detail ?? 'Login failed';

      const looksLikeUnverified =
        anyErr.status === 403 && anyErr.data?.code === 'EMAIL_NOT_VERIFIED';

      if (looksLikeUnverified) {
        const email = form.email?.trim();
        if (email) sessionStorage.setItem('pending_verification_email', email);
        navigate(`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
          replace: true,
          state: { email },
        });
        return;
      }

      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <BrandLogo size="lg" />
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mb-8 text-sm text-gray-400">Sign in to your account to continue.</p>

          <SocialAuthButtons onError={setError} />

          <div className="relative mb-6 flex items-center">
            <div className="flex-1 border-t border-surface-3" />
            <span className="mx-4 text-xs text-gray-500">or sign in with email</span>
            <div className="flex-1 border-t border-surface-3" />
          </div>

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
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-potato-500 hover:text-potato-400">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              Sign in →
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-potato-500 hover:text-potato-400">Create one free</Link>
          </p>
          <p className="mt-3 text-center text-xs text-gray-600">
            <Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Promo panel */}
      <div className="hidden flex-col justify-center bg-surface-1 px-12 py-12 lg:flex lg:w-1/2">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-3 px-3 py-1 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-potato-500" />
          5 AI models, one place
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white leading-tight">
          The smarter way<br />to chat with AI
        </h2>
        <p className="mb-8 text-gray-400">
          Switch between Claude, GPT, Gemini and more — without switching tabs.
        </p>
        <ul className="mb-10 flex flex-col gap-4">
          {[
            ['Multi-model in one interface', 'Change models mid-conversation without losing context or history.'],
            ['Projects & organised history', 'Group chats into projects. Find anything instantly with search.'],
            ['Streamed, fast responses', 'See answers appear in real time. No waiting, no spinners.'],
            ['Private & secure', 'Your chats are never used for training. Encrypted at rest.'],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded bg-surface-3 text-center text-xs leading-5 text-potato-400">✦</span>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {MODELS.map((m) => (
            <span key={m.slug} className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: m.color + '22', color: m.color }}>
              {m.name.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
