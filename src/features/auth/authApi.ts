import { createApi } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../../types/auth.types';
import { baseQueryWithReauth } from '../../utils/baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    socialGoogle: builder.mutation<AuthResponse & { is_new_user: boolean }, { id_token: string }>({
      query: (body) => ({ url: '/auth/social/google', method: 'POST', body }),
    }),
    socialGithub: builder.mutation<AuthResponse & { is_new_user: boolean }, { code: string; state: string }>({
      query: (body) => ({ url: '/auth/social/github', method: 'POST', body }),
    }),
    me: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; email: string; password: string; password_confirmation: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    resendVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/email/resend', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialGoogleMutation,
  useSocialGithubMutation,
  useMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
} = authApi;
