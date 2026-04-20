import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useForgotPasswordMutation } from '../features/auth/authApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } }).data?.message ?? 'Request failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-2xl">🥔</span>
          <span className="text-lg font-semibold text-white">PotatoChat</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-white">Reset your password</h1>
        <p className="mb-8 text-sm text-gray-400">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="rounded-lg border border-surface-3 bg-surface-2 p-4 text-center">
            <p className="text-sm text-gray-300">
              Check your inbox. A password reset link has been sent to <strong className="text-white">{email}</strong>.
            </p>
            <Link to="/login" className="mt-4 inline-block text-sm text-potato-500 hover:text-potato-400">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              Send reset link
            </Button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-potato-500 hover:text-potato-400">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
