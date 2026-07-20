import { configureStore } from '@reduxjs/toolkit';
import authReducer      from '../features/auth/authSlice';
import chatReducer      from '../features/chat/chatSlice';
import streamingReducer from '../features/chat/streamingSlice';
import artifactReducer  from '../features/artifacts/artifactSlice';
import uiReducer        from './uiSlice';
import adminReducer     from '../features/admin/adminSlice';
import { authApi }      from '../features/auth/authApi';
import { chatApi }      from '../features/chat/chatApi';
import { projectsApi }  from '../features/projects/projectsApi';
import { usageApi }     from '../features/usage/usageApi';
import { settingsApi }  from '../features/settings/settingsApi';
import { adminApi }     from '../features/admin/adminApi';
import { promptsApi }   from '../features/prompts/promptsApi';
import { supportApi }   from '../features/support/supportApi';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    chat:      chatReducer,
    streaming: streamingReducer,
    artifact:  artifactReducer,
    ui:        uiReducer,
    admin:     adminReducer,
    [authApi.reducerPath]:     authApi.reducer,
    [chatApi.reducerPath]:     chatApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [usageApi.reducerPath]:    usageApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [adminApi.reducerPath]:    adminApi.reducer,
    [promptsApi.reducerPath]:  promptsApi.reducer,
    [supportApi.reducerPath]:  supportApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      chatApi.middleware,
      projectsApi.middleware,
      usageApi.middleware,
      settingsApi.middleware,
      adminApi.middleware,
      promptsApi.middleware,
      supportApi.middleware,
    ),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
