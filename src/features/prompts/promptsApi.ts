import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../utils/baseQuery';

export interface Prompt {
  id:         string;
  title:      string;
  content:    string;
  category:   string | null;
  is_pinned:  boolean;
  use_count:  number;
  created_at: string;
}

export const promptsApi = createApi({
  reducerPath: 'promptsApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['Prompts'],
  endpoints:   (builder) => ({
    getPrompts: builder.query<Prompt[], { pinned_first?: boolean; search?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.pinned_first) q.set('pinned_first', '1');
        if (params?.search)       q.set('search', params.search);
        return `/prompts?${q}`;
      },
      transformResponse: (r: { data: Prompt[] }) => r.data,
      providesTags: ['Prompts'],
    }),
    createPrompt: builder.mutation<Prompt, { title: string; content: string; category?: string }>({
      query:           (body) => ({ url: '/prompts', method: 'POST', body }),
      transformResponse: (r: { data: Prompt }) => r.data,
      invalidatesTags: ['Prompts'],
    }),
    deletePrompt: builder.mutation<void, string>({
      query:           (id) => ({ url: `/prompts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Prompts'],
    }),
    togglePin: builder.mutation<Prompt, string>({
      query:           (id) => ({ url: `/prompts/${id}/pin`, method: 'PATCH' }),
      transformResponse: (r: { data: Prompt }) => r.data,
      invalidatesTags: ['Prompts'],
    }),
  }),
});

export const {
  useGetPromptsQuery,
  useCreatePromptMutation,
  useDeletePromptMutation,
  useTogglePinMutation,
} = promptsApi;
