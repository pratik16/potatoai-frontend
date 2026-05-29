import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';

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
  ].includes(url);

  if (result.error?.status === 401 && !isPublicAuthRequest) {
    api.dispatch(clearCredentials());
    window.location.href = '/login?session_expired=1';
  }

  return result;
};
