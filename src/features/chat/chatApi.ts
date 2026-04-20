import { createApi } from '@reduxjs/toolkit/query/react';
import type { ChatMeta, ChatDetail } from '../../types/chat.types';
import type { AiModel } from '../../types/model.types';
import { baseQueryWithReauth } from '../../utils/baseQuery';

interface PaginatedChats {
  data: ChatMeta[];
  meta: { current_page: number; per_page: number; total: number; has_more: boolean };
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes: ['Chat', 'Messages', 'Models'],
  endpoints: (builder) => ({
    getChats: builder.query<ChatMeta[], { page?: number; per_page?: number; search?: string; starred?: boolean; project_id?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page)       q.set('page',       String(params.page));
        if (params?.per_page)   q.set('per_page',   String(params.per_page));
        if (params?.search)     q.set('search',     params.search);
        if (params?.starred)    q.set('starred',    '1');
        if (params?.project_id) q.set('project_id', params.project_id);
        return `/chats?${q}`;
      },
      transformResponse: (r: PaginatedChats) => r.data,
      providesTags: ['Chat'],
    }),
    getChat: builder.query<ChatDetail, string>({
      query: (id) => `/chats/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Chat', id }, { type: 'Messages', id }],
    }),
    createChat: builder.mutation<ChatMeta, { title?: string; model?: string; project_id?: string | null }>({
      query: (body) => ({ url: '/chats', method: 'POST', body }),
      invalidatesTags: ['Chat'],
    }),
    updateChat: builder.mutation<ChatMeta, { id: string; title?: string; system_prompt?: string | null; model?: string }>({
      query: ({ id, ...body }) => ({ url: `/chats/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Chat', id }],
    }),
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({ url: `/chats/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Chat'],
    }),
    toggleStar: builder.mutation<{ starred: boolean }, string>({
      query: (id) => ({ url: `/chats/${id}/star`, method: 'PATCH' }),
      invalidatesTags: ['Chat'],
    }),
    createShare: builder.mutation<{ share_url: string; token: string; expires_at: string | null }, string>({
      query: (id) => ({ url: `/chats/${id}/share`, method: 'GET' }),
    }),
    revokeShare: builder.mutation<void, string>({
      query: (id) => ({ url: `/chats/${id}/share`, method: 'DELETE' }),
    }),
    moveChat: builder.mutation<void, { id: string; project_id: string | null }>({
      query: ({ id, project_id }) => ({ url: `/chats/${id}/move`, method: 'PATCH', body: { project_id } }),
      invalidatesTags: ['Chat'],
    }),
    submitFeedback: builder.mutation<void, { chatId: string; msgId: string; vote: 'up' | 'down' }>({
      query: ({ chatId, msgId, vote }) => ({
        url: `/chats/${chatId}/messages/${msgId}/feedback`,
        method: 'POST',
        body: { vote },
      }),
    }),
    getModels: builder.query<AiModel[], void>({
      query: () => '/models',
      transformResponse: (r: { data: AiModel[] } | AiModel[]) =>
        Array.isArray(r) ? r : r.data,
      providesTags: ['Models'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateChatMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useToggleStarMutation,
  useCreateShareMutation,
  useRevokeShareMutation,
  useMoveChatMutation,
  useSubmitFeedbackMutation,
  useGetModelsQuery,
} = chatApi;
