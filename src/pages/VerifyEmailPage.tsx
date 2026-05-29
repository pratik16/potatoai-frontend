import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useResendVerificationMutation } from '../features/auth/authApi';

type LocationState = { email?: string } | null;

export default function VerifyEmailPage() {
  const location = useLocation();
  const stateEmail = (location.state as LocationState)?.email;

  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') ?? undefined;

  const initialEmail = useMemo(() => {
    const stored = sessionStorage.getItem('pending_verification_email') ?? undefined;
    return stateEmail ?? queryEmail ?? stored ?? '';
  }, [stateEmail, queryEmail]);

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    setStatus({ type: 'idle' });
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    try {
      const res = await resendVerification({ email: trimmed }).unwrap();
      setStatus({ type: 'success', message: res?.message ?? 'Verification email sent.' });
      sessionStorage.setItem('pending_verification_email', trimmed);
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string; detail?: string } }).data;
      setStatus({
        type: 'error',
        message: errorData?.message ?? errorData?.detail ?? 'Failed to send verification email.',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-2xl">🥔</span>
          <span className="text-lg font-semibold text-white">PotatoChat</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Verify your email</h1>
        <p className="mb-6 text-sm text-gray-400">
          Your account exists, but your email address isn&apos;t verified yet. Check your inbox for a verification link, or resend it below.
        </p>

        <div className="flex flex-col gap-4">
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

          {status.type === 'success' && <p className="text-sm text-green-400">{status.message}</p>}
          {status.type === 'error' && <p className="text-sm text-red-400">{status.message}</p>}

          <Button type="button" loading={isLoading} size="lg" className="w-full" onClick={handleResend}>
            Resend verification email
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-potato-500 hover:text-potato-400">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

