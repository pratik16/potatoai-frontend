import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../utils/baseQuery';

export const supportApi = createApi({
  reducerPath: 'supportApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    requestAccountDeletion: builder.mutation<
      { message: string },
      { email: string; message?: string }
    >({
      query: (body) => ({
        url: '/support/account-deletion-request',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRequestAccountDeletionMutation } = supportApi;
