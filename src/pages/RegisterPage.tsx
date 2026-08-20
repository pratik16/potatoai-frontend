import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User } from 'lucide-react';
import { useRegisterMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { BrandLogo } from '../components/BrandLogo';
import { apiErrorMessage, apiFieldErrors } from '../utils/apiError';

export default function RegisterPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm]   = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }
    try {
      const result = await register(form).unwrap();
      dispatch(setCredentials(result));
      navigate('/chat/new');
    } catch (err: unknown) {
      // Before the API returned 422s these arrived as a bare 500, so the map was
      // always empty and every field error collapsed into one generic line.
      const fields = apiFieldErrors(err);
      setFieldErrors(fields);
      setError(
        Object.keys(fields).length > 0
          ? ''
          : apiErrorMessage(err, 'Registration failed'),
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Helmet>
        <title>Create your account — PotatoAIHub | PotatoChat</title>
        <meta
          name="description"
          content="Create a free PotatoAIHub account to try PotatoChat, a ChatGPT alternative with Claude, GPT, Gemini and more AI models, image generation, and project-organized chat history."
        />
      </Helmet>
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <BrandLogo size="lg" />
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">Create your account</h1>
          <p className="mb-8 text-sm text-gray-400">Start chatting with AI models for free.</p>

          <SocialAuthButtons onError={setError} />

          <div className="relative mb-6 flex items-center">
            <div className="flex-1 border-t border-surface-3" />
            <span className="mx-4 text-xs text-gray-500">or register with email</span>
            <div className="flex-1 border-t border-surface-3" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="name"
              type="text"
              label="Full name"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              leftIcon={<User className="h-4 w-4" />}
              error={fieldErrors.name}
              required
            />
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              leftIcon={<Mail className="h-4 w-4" />}
              error={fieldErrors.email}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              leftIcon={<Lock className="h-4 w-4" />}
              error={fieldErrors.password}
              required
            />
            <Input
              id="password_confirmation"
              type="password"
              label="Confirm password"
              placeholder="••••••••••"
              value={form.password_confirmation}
              onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              leftIcon={<Lock className="h-4 w-4" />}
              error={fieldErrors.password_confirmation}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              Create account →
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-potato-500 hover:text-potato-400">Sign in</Link>
          </p>
          <p className="mt-3 text-center text-xs text-gray-600">
            By creating an account you agree to our{' '}
            <Link to="/privacy" className="text-potato-500 hover:text-potato-400">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-center bg-surface-1 px-12 py-12 lg:flex lg:w-1/2">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-3 px-3 py-1 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-potato-500" />
          Free to start
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white leading-tight">
          Everything you need<br />to chat smarter
        </h2>
        <p className="mb-8 text-gray-400">
          Access Claude, GPT, Gemini and more from a single account.
        </p>
        <ul className="flex flex-col gap-4">
          {[
            'Free credits on sign-up',
            'Unlimited chat history',
            'Organised project folders',
            'Export your data anytime',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-gray-300">
              <span className="h-5 w-5 shrink-0 rounded bg-surface-3 text-center text-xs leading-5 text-potato-400">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
