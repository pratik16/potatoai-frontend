import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthResponse } from '../../types/auth.types';
import { normalizeAuthUser } from '../../utils/normalizeAuthUser';

const stored = localStorage.getItem('auth');
const persisted = stored ? JSON.parse(stored) : null;
const persistedUser = persisted?.user ? normalizeAuthUser(persisted.user) : null;

const initialState: AuthState = {
  user:            persistedUser,
  token:           persisted?.token ?? null,
  isAuthenticated: !!persisted?.token,
  isLoading:       false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const user = normalizeAuthUser(action.payload.user);
      state.user            = user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ user, token: action.payload.token }));
    },
    clearCredentials: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = normalizeAuthUser({ ...state.user, ...action.payload });
        localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
