import { createApi } from '@reduxjs/toolkit/query/react';
import type { User, CreditBalance, CreditTransaction, ActiveSession } from '../../types/auth.types';
import { baseQueryWithReauth } from '../../utils/baseQuery';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes: ['Settings', 'Sessions', 'Credits', 'ApiKeys', 'Prompts'],
  endpoints: (builder) => ({
    getSettings: builder.query<User, void>({
      query: () => '/user/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<User, Partial<User>>({
      query: (body) => ({ url: '/user/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
    changePassword: builder.mutation<{ message: string }, { current_password: string; password: string; password_confirmation: string }>({
      query: (body) => ({ url: '/user/password', method: 'PUT', body }),
    }),
    uploadAvatar: builder.mutation<{ avatar_url: string }, FormData>({
      query: (body) => ({ url: '/user/avatar', method: 'POST', body }),
      invalidatesTags: ['Settings'],
    }),
    removeAvatar: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/user/avatar', method: 'DELETE' }),
      invalidatesTags: ['Settings'],
    }),
    enable2FA: builder.mutation<{ secret: string; qr_code_url: string; backup_codes: string[] }, void>({
      query: () => ({ url: '/user/2fa/enable', method: 'POST' }),
    }),
    verify2FA: builder.mutation<{ message: string }, { code: string }>({
      query: (body) => ({ url: '/user/2fa/verify', method: 'POST', body }),
      invalidatesTags: ['Settings'],
    }),
    disable2FA: builder.mutation<{ message: string }, { password: string }>({
      query: (body) => ({ url: '/user/2fa', method: 'DELETE', body }),
      invalidatesTags: ['Settings'],
    }),
    getSessions: builder.query<{ data: ActiveSession[] }, void>({
      query: () => '/user/sessions',
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/user/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions'],
    }),
    revokeAllSessions: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/user/sessions', method: 'DELETE' }),
      invalidatesTags: ['Sessions'],
    }),
    getCredits: builder.query<CreditBalance, void>({
      query: () => '/user/credits',
      providesTags: ['Credits'],
    }),
    getTransactions: builder.query<{ data: CreditTransaction[]; meta: object }, { page?: number; type?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.set('page', String(params.page));
        if (params?.type) q.set('type', params.type);
        return `/user/credits/transactions?${q}`;
      },
    }),
    getApiKeys: builder.query<{ data: ApiKey[] }, void>({
      query: () => '/user/api-keys',
      providesTags: ['ApiKeys'],
    }),
    createApiKey: builder.mutation<{ id: number; name: string; key: string; key_prefix: string; scopes: string[] }, { name: string; scopes: string[] }>({
      query: (body) => ({ url: '/user/api-keys', method: 'POST', body }),
      invalidatesTags: ['ApiKeys'],
    }),
    deleteApiKey: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/user/api-keys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ApiKeys'],
    }),
    deleteAccount: builder.mutation<{ message: string }, { confirmation: string; password: string }>({
      query: (body) => ({ url: '/user', method: 'DELETE', body }),
    }),
  }),
});

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetCreditsQuery,
  useGetTransactionsQuery,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
  useDeleteAccountMutation,
} = settingsApi;
