import { useEffect, useMemo, useState } from 'react';
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

const ANDROID_STATE_PREFIX = 'android.';
const ANDROID_PACKAGE = 'com.potatoaihub.chat';

function buildAndroidDeepLinks(params: URLSearchParams): { custom: string; intent: string } {
  const deepLink = new URLSearchParams();
  for (const key of ['code', 'state', 'error', 'error_description'] as const) {
    const value = params.get(key);
    if (value != null) deepLink.set(key, value);
  }
  const query = deepLink.toString();
  const custom = `potatochat://oauth/github?${query}`;
  // Chrome Custom Tabs often handles intent:// more reliably than custom schemes alone.
  const intent =
    `intent://oauth/github?${query}` +
    `#Intent;scheme=potatochat;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(custom)};end`;
  return { custom, intent };
}

export default function GithubOAuthCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [socialGithub] = useSocialGithubMutation();
  const [error, setError] = useState('');

  const isAndroidHandoff = (searchParams.get('state') ?? '').startsWith(ANDROID_STATE_PREFIX);
  const androidLinks = useMemo(
    () => (isAndroidHandoff ? buildAndroidDeepLinks(searchParams) : null),
    [isAndroidHandoff, searchParams],
  );

  useEffect(() => {
    const state = searchParams.get('state');

    // PotatoChat Android: hand off to the app (do not complete login in the browser).
    if (state?.startsWith(ANDROID_STATE_PREFIX) && androidLinks) {
      window.location.replace(androidLinks.intent);
      return;
    }

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError('GitHub sign-in was cancelled or denied.');
      return;
    }

    const code = searchParams.get('code');

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
  }, [androidLinks, dispatch, navigate, searchParams, socialGithub]);

  if (isAndroidHandoff && androidLinks) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-gray-300">Opening PotatoChat…</p>
        <p className="max-w-sm text-xs text-gray-500">
          If the app does not open automatically, tap the button below.
        </p>
        <a
          href={androidLinks.custom}
          className="rounded-lg bg-potato-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-potato-400"
        >
          Open PotatoChat
        </a>
      </div>
    );
  }

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
