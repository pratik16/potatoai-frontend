import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen:           boolean;
  keyboardShortcutsOpen: boolean;
  mobileDrawerOpen:      boolean;
  isOnline:              boolean;
  toast:                 { message: string; type: 'success' | 'error' | 'info' } | null;
}

const initialState: UiState = {
  sidebarOpen:           true,
  keyboardShortcutsOpen: false,
  mobileDrawerOpen:      false,
  isOnline:              typeof navigator !== 'undefined' ? navigator.onLine : true,
  toast:                 null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar:           (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen:          (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    toggleKeyboardShortcuts: (state) => { state.keyboardShortcutsOpen = !state.keyboardShortcutsOpen; },
    setMobileDrawer:         (state, action: PayloadAction<boolean>) => { state.mobileDrawerOpen = action.payload; },
    setOnline:               (state, action: PayloadAction<boolean>) => { state.isOnline = action.payload; },
    showToast:               (state, action: PayloadAction<UiState['toast']>) => { state.toast = action.payload; },
    clearToast:              (state) => { state.toast = null; },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleKeyboardShortcuts,
  setMobileDrawer,
  setOnline,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
