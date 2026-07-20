import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Trash2 } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { useTheme } from '../hooks/useTheme';
import { useRequestAccountDeletionMutation } from '../features/support/supportApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BrandLogo } from '../components/BrandLogo';

export default function DeleteAccountRequestPage() {
  useTheme();
  const authUser = useAppSelector((s) => s.auth.user);
  const [requestDeletion, { isLoading }] = useRequestAccountDeletionMutation();
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestDeletion({
        email: email.trim(),
        message: message.trim() || undefined,
      }).unwrap();
      setSubmitted(true);
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: { code?: string; message?: string; detail?: string };
      };
      if (apiErr.status === 429 && apiErr.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setError(apiErr.data.message ?? 'Too many requests. Please try again later.');
        return;
      }
      setError(apiErr.data?.message ?? apiErr.data?.detail ?? 'Request failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1 px-6 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>
          <Link to="/privacy" className="text-sm text-potato-500 hover:text-potato-400">
            Privacy Policy
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Trash2 className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Request account deletion</h1>
        <p className="mb-8 text-sm text-gray-400">
          Submit your account email and we will process your deletion request. We may contact you
          to verify your identity before removing your account and associated data.
        </p>

        {submitted ? (
          <div className="rounded-lg border border-surface-3 bg-surface-2 p-5">
            <p className="text-sm text-gray-300">
              Your deletion request for <strong className="text-white">{email}</strong> has been
              submitted. Our team will review it and follow up by email.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link to="/login" className="text-potato-500 hover:text-potato-400">
                Back to sign in
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Account email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-300">
                Additional details (optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Username, reason, or anything that helps us locate your account"
                className="w-full rounded-lg border border-surface-3 bg-surface-2 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-potato-500 focus:outline-none focus:ring-1 focus:ring-potato-500"
                maxLength={2000}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              Submit deletion request
            </Button>
            <p className="text-center text-xs text-gray-500">
              Signed in users can also delete immediately from{' '}
              <Link to="/settings" className="text-potato-500 hover:text-potato-400">
                Settings
              </Link>
              .
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
