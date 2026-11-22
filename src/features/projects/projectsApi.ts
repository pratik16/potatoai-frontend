import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import type { Project, ProjectDetail, ProjectFileLimits } from '../../types/project.types';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { chatApi } from '../chat/chatApi';
import { routeIfEmailNotVerified } from '../../utils/baseQuery';

const rawProjectsBase = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Project file uploads are a paid route (phase0b-auth.md §3): send an unverified
// account to the verify screen, same as every baseQueryWithReauth API.
const projectsBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions,
) => {
  const result = await rawProjectsBase(args, api, extraOptions);
  routeIfEmailNotVerified(result.error, typeof args === 'string' ? args : args.url, api.dispatch);
  return result;
};

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: projectsBaseQuery,
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], { sort?: string } | void>({
      query: (params) => `/projects${params?.sort ? `?sort=${params.sort}` : ''}`,
      transformResponse: (r: { data: Project[] }) => r.data,
      providesTags: ['Project'],
    }),
    getProject: builder.query<ProjectDetail, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(chatApi.util.invalidateTags(['Chat']));
      },
    }),
    updateProject: builder.mutation<Project, { id: string } & Partial<Project>>({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }],
    }),
    deleteProject: builder.mutation<{ deleted_chats: number }, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(chatApi.util.invalidateTags(['Chat']));
      },
    }),
    getFileLimits: builder.query<ProjectFileLimits, void>({
      query: () => '/projects/file-limits',
    }),
    addProjectFile: builder.mutation<Project, { projectId: string; file: File }>({
      query: ({ projectId, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/projects/${projectId}/files`, method: 'POST', body };
      },
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Project', id: projectId }],
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            projectsApi.util.updateQueryData('getProject', projectId, (draft) => {
              draft.files = data.files ?? [];
            }),
          );
        } catch { /* invalidatesTags refetch on failure */ }
      },
    }),
    removeProjectFile: builder.mutation<Project, { projectId: string; filename: string }>({
      query: ({ projectId, filename }) => ({
        url: `/projects/${projectId}/files`,
        method: 'DELETE',
        body: { filename },
      }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Project', id: projectId }],
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            projectsApi.util.updateQueryData('getProject', projectId, (draft) => {
              draft.files = data.files ?? [];
            }),
          );
        } catch { /* invalidatesTags refetch on failure */ }
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetFileLimitsQuery,
  useAddProjectFileMutation,
  useRemoveProjectFileMutation,
} = projectsApi;
