import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminState } from '../../types/admin.types';

const initialState: AdminState = {
  isAccessVerified: false,
  currentIp:        null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAccessVerified: (state, action: PayloadAction<boolean>) => {
      state.isAccessVerified = action.payload;
    },
    setCurrentIp: (state, action: PayloadAction<string | null>) => {
      state.currentIp = action.payload;
    },
  },
});

export const { setAccessVerified, setCurrentIp } = adminSlice.actions;
export default adminSlice.reducer;
