import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';
import { requireEmailVerification } from '../app/uiSlice';
import { isEmailNotVerified } from '../features/auth/verification';
import type { ApiErrorBody } from './apiError';

/**
 * Paid calls (image, project upload, anything that spends credits) answer an
 * unverified account with 403 EMAIL_NOT_VERIFIED (replica/contracts/phase0b-auth.md §3).
 * Route to the verify screen from here so every RTK endpoint gets it without each
 * caller re-implementing the branch. Login is excluded: LoginPage already routes its
 * own 403 with the email the user just typed.
 */
export function routeIfEmailNotVerified(
  error: FetchBaseQueryError | undefined,
  url: string,
  dispatch: (action: unknown) => unknown,
): void {
  if (!error || url === '/auth/login') return;
  if (isEmailNotVerified(error.status as number, error.data as ApiErrorBody | undefined)) {
    dispatch(requireEmailVerification({ email: null }));
  }
}

const rawBase = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions,
) => {
  const result = await rawBase(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args.url;
  const isPublicAuthRequest = [
    '/auth/login',
    '/auth/users/register',
    '/auth/config',
    '/auth/social/google',
    '/auth/social/github',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/users/resend-verification',
    '/support/account-deletion-request',
  ].includes(url);

  if (result.error?.status === 401 && !isPublicAuthRequest) {
    api.dispatch(clearCredentials());
    window.location.href = '/login?session_expired=1';
  }

  routeIfEmailNotVerified(result.error, url, api.dispatch);

  return result;
};
