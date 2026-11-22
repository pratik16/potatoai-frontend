import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useResendVerificationMutation } from '../features/auth/authApi';
import { useAuthThrottle } from '../features/auth/useAuthThrottle';
import { ThrottleNotice } from '../features/auth/components/ThrottleNotice';
import { PENDING_VERIFICATION_EMAIL_KEY } from '../features/auth/verification';
import { clearCredentials } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { apiErrorMessage } from '../utils/apiError';
import { BrandLogo } from '../components/BrandLogo';

type LocationState = { email?: string } | null;

function readStoredEmail(): string | undefined {
  try {
    return sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * The verify screen (replica/contracts/phase0b-auth.md §1–3). Reached from:
 *   - register with `requires_verification: true` (signed in, unverified),
 *   - login 403 EMAIL_NOT_VERIFIED (signed out),
 *   - any paid call 403 EMAIL_NOT_VERIFIED, including mid-chat (signed in).
 * When signed in, verifying in another tab makes the same token work, so the
 * primary way back is "Continue to chat", not a second sign-in.
 */
export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as LocationState)?.email || undefined;

  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') || undefined;

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userEmail       = useAppSelector((s) => s.auth.user?.email) || undefined;

  const initialEmail = useMemo(
    () => stateEmail ?? queryEmail ?? userEmail ?? readStoredEmail() ?? '',
    [stateEmail, queryEmail, userEmail],
  );

  const [email, setEmail] = useState(initialEmail);
  // Only offer to edit the address when we don't already know where the link went.
  const [editing, setEditing] = useState(!initialEmail);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const { isThrottled, secondsLeft, catchThrottle } = useAuthThrottle();

  const handleResend = async () => {
    setStatus({ type: 'idle' });
    const trimmed = email.trim();
    if (!trimmed) {
      setEditing(true);
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    try {
      await resendVerification({ email: trimmed }).unwrap();
      setStatus({ type: 'success', message: `We sent a new link to ${trimmed}.` });
      setEditing(false);
      try { sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, trimmed); } catch { /* ignore */ }
    } catch (err: unknown) {
      if (catchThrottle(err)) return;
      setStatus({ type: 'error', message: apiErrorMessage(err, 'Failed to send verification email.') });
    }
  };

  const handleSignOut = () => {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-12">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8">
          <BrandLogo size="lg" />
        </div>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-potato-500">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Verify your email</h1>

        {initialEmail && !editing ? (
          <p className="mb-6 text-sm text-gray-400" data-testid="verify-email-address">
            We sent a verification link to{' '}
            <strong className="break-all font-medium text-white">{email}</strong>.
            Open it to start chatting. You need a verified email before you can use credits.
          </p>
        ) : (
          <p className="mb-6 text-sm text-gray-400">
            Your email address isn&apos;t verified yet. Enter it below and we&apos;ll send a new link.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {editing && (
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
          )}

          <div aria-live="polite">
            {status.type === 'success' && <p className="text-sm text-green-400">{status.message}</p>}
          </div>
          {status.type === 'error' && <p role="alert" className="text-sm text-red-400">{status.message}</p>}
          {isThrottled && <ThrottleNotice key="throttle" secondsLeft={secondsLeft} />}

          <Button
            type="button"
            variant={isAuthenticated ? 'secondary' : 'primary'}
            loading={isLoading}
            disabled={isThrottled}
            size="lg"
            className="w-full"
            onClick={handleResend}
          >
            Resend email
          </Button>

          {isAuthenticated && (
            <Button type="button" size="lg" className="w-full" onClick={() => navigate('/chat/new')}>
              I&apos;ve verified, continue to chat
            </Button>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            {/* A signed-in account's address is fixed; offering to change it would send
                the link to some other account. */}
            {!isAuthenticated && initialEmail && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-gray-500 hover:text-gray-300"
              >
                Wrong address?
              </button>
            )}
            {isAuthenticated ? (
              <button type="button" onClick={handleSignOut} className="text-potato-500 hover:text-potato-400">
                Sign out
              </button>
            ) : (
              <Link to="/login" className="text-potato-500 hover:text-potato-400">Back to sign in</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
