import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  DashboardData, AdminModel, PricingRow, NewPricingData, PricingHistoryResponse,
  CreditsConfig, IpListResponse, IpEntry,
  AuditLogResponse, AuditLogParams,
  UsersResponse, UserListParams, AdminUser,
  RevenueData, UsageAnalyticsData,
} from '../../types/admin.types';

const adminBaseQuery = fetchBaseQuery({
  baseUrl: '/api/admin',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery:   adminBaseQuery,
  tagTypes:    ['Dashboard', 'Models', 'Pricing', 'CreditsConfig', 'IpWhitelist', 'AuditLog', 'Users'],
  endpoints:   (builder) => ({

    getDashboard: builder.query<DashboardData, void>({
      query:              () => '/',
      transformResponse:  (r: { data: DashboardData }) => r.data,
      providesTags:       ['Dashboard'],
      keepUnusedDataFor:  60,
    }),

    getAdminModels: builder.query<AdminModel[], void>({
      query:             () => '/models',
      transformResponse: (r: { data: AdminModel[] }) => r.data,
      providesTags:      ['Models'],
    }),
    toggleModel: builder.mutation<AdminModel, { id: number; patch: Partial<AdminModel> }>({
      query:            ({ id, patch }) => ({ url: `/models/${id}`, method: 'PATCH', body: patch }),
      transformResponse: (r: { data: AdminModel }) => r.data,
      invalidatesTags:  ['Models', 'Pricing'],
    }),

    getAdminPricing: builder.query<AdminModel[], void>({
      query:             () => '/pricing',
      transformResponse: (r: { data: AdminModel[] }) => r.data,
      providesTags:      ['Pricing'],
    }),
    savePricing: builder.mutation<PricingRow, { modelId: number; data: NewPricingData }>({
      query:            ({ modelId, data }) => ({ url: `/pricing/${modelId}`, method: 'POST', body: data }),
      transformResponse: (r: { data: PricingRow }) => r.data,
      invalidatesTags:  ['Pricing', 'Models'],
    }),
    getPricingHistory: builder.query<PricingHistoryResponse, number>({
      query:             (modelId) => `/pricing/${modelId}/history`,
      transformResponse: (r: { data: PricingHistoryResponse }) => r.data,
    }),

    getCreditsConfig: builder.query<CreditsConfig, void>({
      query:             () => '/credits-config',
      transformResponse: (r: { data: CreditsConfig }) => r.data,
      providesTags:      ['CreditsConfig'],
    }),
    updateCreditsConfig: builder.mutation<CreditsConfig, Partial<CreditsConfig>>({
      query:            (data) => ({ url: '/credits-config', method: 'PUT', body: data }),
      transformResponse: (r: { data: CreditsConfig }) => r.data,
      invalidatesTags:  ['CreditsConfig'],
    }),

    getIps: builder.query<IpListResponse, void>({
      query:            () => '/ips',
      transformResponse: (r: IpListResponse & { success: boolean }) => ({ current_ip: r.current_ip, data: r.data }),
      providesTags:     ['IpWhitelist'],
    }),
    addIp: builder.mutation<IpEntry, { ip_address: string; label: string }>({
      query:            (data) => ({ url: '/ips', method: 'POST', body: data }),
      transformResponse: (r: { data: IpEntry }) => r.data,
      invalidatesTags:  ['IpWhitelist'],
    }),
    updateIp: builder.mutation<IpEntry, { id: number; patch: Partial<IpEntry> }>({
      query:            ({ id, patch }) => ({ url: `/ips/${id}`, method: 'PATCH', body: patch }),
      transformResponse: (r: { data: IpEntry }) => r.data,
      invalidatesTags:  ['IpWhitelist'],
    }),
    deleteIp: builder.mutation<void, number>({
      query:           (id) => ({ url: `/ips/${id}`, method: 'DELETE' }),
      invalidatesTags: ['IpWhitelist'],
    }),

    getAuditLog: builder.query<AuditLogResponse, AuditLogParams>({
      query:             (params) => ({ url: '/audit', params }),
      transformResponse: (r: { data: AuditLogResponse['data']; meta: AuditLogResponse['meta'] }) => ({ data: r.data, meta: r.meta }),
      providesTags:      ['AuditLog'],
    }),

    getAdminUsers: builder.query<UsersResponse, UserListParams>({
      query:             (params) => ({ url: '/users', params }),
      transformResponse: (r: { data: AdminUser[]; meta: UsersResponse['meta'] }) => ({ data: r.data, meta: r.meta }),
      providesTags:      ['Users'],
    }),
    getAdminUser: builder.query<AdminUser, number>({
      query:             (id) => `/users/${id}`,
      transformResponse: (r: { data: AdminUser }) => r.data,
    }),
    adjustCredits: builder.mutation<void, { userId: number; data: { amount: number; type: string; description: string } }>({
      query:           ({ userId, data }) => ({ url: `/users/${userId}/adjust-credits`, method: 'POST', body: data }),
      invalidatesTags: ['Users'],
    }),
    suspendUser: builder.mutation<void, { userId: number; suspended: boolean }>({
      query:           ({ userId, suspended }) => ({ url: `/users/${userId}/suspend`, method: 'PATCH', body: { suspended } }),
      invalidatesTags: ['Users'],
    }),

    getRevenue: builder.query<RevenueData, { month?: string }>({
      query: (params) => ({ url: '/analytics/revenue', params }),
      transformResponse: (r: { data: RevenueData }) => r.data,
    }),
    getUsageAnalytics: builder.query<UsageAnalyticsData, { month?: string }>({
      query: (params) => ({ url: '/analytics/usage', params }),
      transformResponse: (r: { data: UsageAnalyticsData }) => r.data,
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminModelsQuery,
  useToggleModelMutation,
  useGetAdminPricingQuery,
  useSavePricingMutation,
  useGetPricingHistoryQuery,
  useGetCreditsConfigQuery,
  useUpdateCreditsConfigMutation,
  useGetIpsQuery,
  useAddIpMutation,
  useUpdateIpMutation,
  useDeleteIpMutation,
  useGetAuditLogQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useAdjustCreditsMutation,
  useSuspendUserMutation,
  useGetRevenueQuery,
  useGetUsageAnalyticsQuery,
} = adminApi;
