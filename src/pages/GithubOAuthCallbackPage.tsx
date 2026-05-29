import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSocialGithubMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import {
  clearGithubOAuthState,
  peekGithubOAuthState,
  releaseGithubExchangeLock,
  tryAcquireGithubExchangeLock,
} from '../utils/githubOAuth';
import { Spinner } from '../components/ui/Spinner';

export default function GithubOAuthCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [socialGithub] = useSocialGithubMutation();
  const [error, setError] = useState('');

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError('GitHub sign-in was cancelled or denied.');
      return;
    }

    const code  = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing GitHub authorization data.');
      return;
    }

    if (!peekGithubOAuthState(state)) {
      setError('Invalid sign-in session. Please try again from the login page.');
      return;
    }

    if (!tryAcquireGithubExchangeLock(code)) {
      return;
    }

    void (async () => {
      try {
        const result = await socialGithub({ code, state }).unwrap();
        clearGithubOAuthState();
        dispatch(setCredentials(result));
        navigate('/chat/new', { replace: true });
      } catch (err: unknown) {
        const e = err as { data?: { message?: string; detail?: string } };
        setError(e.data?.message ?? e.data?.detail ?? 'GitHub sign-in failed');
      } finally {
        releaseGithubExchangeLock(code);
      }
    })();
  }, [dispatch, navigate, searchParams, socialGithub]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <Link to="/login" className="text-sm text-potato-500 hover:text-potato-400">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-0">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-gray-400">Completing GitHub sign-in…</p>
    </div>
  );
}
