import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAuthConfigQuery,
  useSocialGoogleMutation,
} from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../app/hooks';
import { startGithubOAuth } from '../../utils/githubOAuth';
import type { AuthResponse } from '../../types/auth.types';

interface SocialAuthButtonsProps {
  onError?: (message: string) => void;
}

export function SocialAuthButtons({ onError }: SocialAuthButtonsProps) {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const googleRef = useRef<HTMLDivElement>(null);

  const { data: authConfig, isLoading: configLoading } = useGetAuthConfigQuery();
  const [socialGoogle, { isLoading: googleLoading }] = useSocialGoogleMutation();

  const [googleReady, setGoogleReady] = useState(false);

  const googleClientId = authConfig?.googleClientId ?? null;
  const githubClientId = authConfig?.githubClientId ?? null;
  const githubRedirectUri = authConfig?.githubRedirectUri ?? null;

  const reportError = useCallback(
    (message: string) => onError?.(message),
    [onError],
  );

  const finishLogin = useCallback(
    (result: AuthResponse) => {
      dispatch(setCredentials(result));
      navigate('/chat/new');
    },
    [dispatch, navigate],
  );

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      try {
        const result = await socialGoogle({ id_token: credential }).unwrap();
        finishLogin(result);
      } catch (err: unknown) {
        const e = err as { data?: { message?: string; detail?: string } };
        reportError(e.data?.message ?? e.data?.detail ?? 'Google sign-in failed');
      }
    },
    [socialGoogle, finishLogin, reportError],
  );

  useEffect(() => {
    if (!googleClientId || !googleRef.current) return;

    const initGoogle = () => {
      const google = window.google?.accounts?.id;
      if (!google || !googleRef.current) return;

      googleRef.current.innerHTML = '';

      google.initialize({
        client_id: googleClientId,
        callback: (response) => {
          const token = response.credential;
          if (token) void handleGoogleCredential(token);
        },
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt:    false,
      });

      google.renderButton(googleRef.current, {
        type:  'standard',
        theme: 'filled_black',
        size:  'large',
        text:  'continue_with',
        shape: 'rectangular',
        width: googleRef.current.offsetWidth || 360,
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(interval);
        initGoogle();
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
      if (googleRef.current) googleRef.current.innerHTML = '';
    };
  }, [googleClientId, handleGoogleCredential]);

  const handleGithub = () => {
    if (!githubClientId || !githubRedirectUri) {
      reportError('GitHub sign-in is not configured.');
      return;
    }
    startGithubOAuth(githubClientId, githubRedirectUri);
  };

  const googleConfigured = Boolean(googleClientId);
  const googleDisabled = configLoading || !googleConfigured || !googleReady;
  const githubDisabled = configLoading || !githubClientId || !githubRedirectUri;

  const googlePlaceholder = configLoading
    ? 'Loading sign-in options…'
    : !googleConfigured
      ? 'Continue with Google (not configured)'
      : 'Loading Google sign-in…';

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div
        className={
          googleDisabled
            ? 'relative flex min-h-[44px] items-center justify-center rounded-lg border border-surface-3 bg-surface-2 px-4 py-2.5 text-sm text-gray-500'
            : 'w-full [&>div]:!w-full [&>div>div]:!w-full'
        }
      >
        {googleDisabled && (
          <span className={googleConfigured ? 'absolute inset-0 flex items-center justify-center' : undefined}>
            {googlePlaceholder}
          </span>
        )}
        {googleConfigured && (
          <div
            ref={googleRef}
            className={googleDisabled ? 'invisible h-0 w-full overflow-hidden' : 'w-full'}
            aria-busy={googleLoading}
            aria-hidden={googleDisabled}
          />
        )}
      </div>

      <button
        type="button"
        disabled={githubDisabled || googleLoading}
        onClick={handleGithub}
        className="flex items-center justify-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-4 py-2.5 text-sm text-white hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden>🐙</span>
        Continue with GitHub
      </button>
    </div>
  );
}
