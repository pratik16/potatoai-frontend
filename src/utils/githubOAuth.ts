export const GITHUB_OAUTH_STATE_KEY = 'github_oauth_state';

export function githubCallbackUrl(): string {
  return `${window.location.origin}/oauth/github/callback`;
}

export function startGithubOAuth(githubClientId: string): void {
  const state = crypto.randomUUID();
  sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id:     githubClientId,
    redirect_uri:  githubCallbackUrl(),
    scope:         'read:user user:email',
    state,
  });

  window.location.assign(`https://github.com/login/oauth/authorize?${params}`);
}

/** Validate CSRF state without clearing (safe for React Strict Mode double-mount). */
export function peekGithubOAuthState(receivedState: string | null): boolean {
  const expected = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
  return !!expected && !!receivedState && expected === receivedState;
}

export function clearGithubOAuthState(): void {
  sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
}

/** @deprecated Prefer peekGithubOAuthState + clearGithubOAuthState after success */
export function consumeGithubOAuthState(receivedState: string | null): boolean {
  const ok = peekGithubOAuthState(receivedState);
  if (ok) clearGithubOAuthState();
  return ok;
}

function exchangeLockKey(code: string): string {
  return `github_oauth_exchange:${code}`;
}

/** One exchange per authorization code (Strict Mode runs effects twice in dev). */
export function tryAcquireGithubExchangeLock(code: string): boolean {
  const key = exchangeLockKey(code);
  if (sessionStorage.getItem(key)) return false;
  sessionStorage.setItem(key, '1');
  return true;
}

export function releaseGithubExchangeLock(code: string): void {
  sessionStorage.removeItem(exchangeLockKey(code));
}
