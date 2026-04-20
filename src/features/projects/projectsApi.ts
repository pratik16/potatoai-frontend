import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import type { Project, ProjectDetail } from '../../types/project.types';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
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
    }),
    updateProject: builder.mutation<Project, { id: string } & Partial<Project>>({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }],
    }),
    deleteProject: builder.mutation<{ deleted_chats: number }, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
