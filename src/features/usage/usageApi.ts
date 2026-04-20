import { createApi } from '@reduxjs/toolkit/query/react';
import type { UsageResponse, TokenUsageResponse } from '../../types/usage.types';
import { baseQueryWithReauth } from '../../utils/baseQuery';

export const usageApi = createApi({
  reducerPath: 'usageApi',
  baseQuery:   baseQueryWithReauth,
  endpoints: (builder) => ({
    getUsage: builder.query<UsageResponse, string | void>({
      query: (month) => `/usage${month ? `?month=${month}` : ''}`,
    }),
    getTokenUsage: builder.query<TokenUsageResponse, string | void>({
      query: (month) => `/usage/tokens${month ? `?month=${month}` : ''}`,
    }),
  }),
});

export const { useGetUsageQuery, useGetTokenUsageQuery } = usageApi;
