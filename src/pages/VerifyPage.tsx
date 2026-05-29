import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useVerifyEmailKeyMutation } from '../features/auth/authApi';

export default function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const key = searchParams.get('key') ?? '';
  const error = searchParams.get('error');

  const [verifyEmailKey, { isLoading }] = useVerifyEmailKeyMutation();
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }
    if (!key) return;

    (async () => {
      setStatus({ type: 'idle' });
      try {
        await verifyEmailKey({ key }).unwrap();
        setStatus({ type: 'success', message: 'Email verified. You can sign in now.' });
        navigate('/login?verified=1', { replace: true });
      } catch (e: unknown) {
        const anyErr = e as { data?: { detail?: string; message?: string } };
        setStatus({ type: 'error', message: anyErr.data?.detail ?? anyErr.data?.message ?? 'Verification failed.' });
      }
    })();
  }, [error, key, navigate, verifyEmailKey]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="text-2xl">🥔</span>
          <span className="text-lg font-semibold text-white">PotatoChat</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Verifying…</h1>

        {(isLoading || (key && status.type === 'idle')) && (
          <div className="mt-6 flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {status.type === 'success' && <p className="mt-4 text-sm text-green-400">{status.message}</p>}
        {status.type === 'error' && <p className="mt-4 text-sm text-red-400">{status.message}</p>}

        {status.type === 'error' && (
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/verify-email" className="text-sm text-potato-500 hover:text-potato-400">
              Resend verification email
            </Link>
            <Button type="button" size="lg" className="w-full" onClick={() => navigate('/login')}>
              Back to sign in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

