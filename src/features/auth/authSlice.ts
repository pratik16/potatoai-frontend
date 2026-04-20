import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthResponse } from '../../types/auth.types';

const stored = localStorage.getItem('auth');
const persisted = stored ? JSON.parse(stored) : null;

const initialState: AuthState = {
  user:            persisted?.user ?? null,
  token:           persisted?.token ?? null,
  isAuthenticated: !!persisted?.token,
  isLoading:       false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ user: action.payload.user, token: action.payload.token }));
    },
    clearCredentials: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
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
