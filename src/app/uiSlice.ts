import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen:           boolean;
  keyboardShortcutsOpen: boolean;
  mobileDrawerOpen:      boolean;
  isOnline:              boolean;
  toast:                 { message: string; type: 'success' | 'error' | 'info' } | null;
  /**
   * Set when a paid call answers 403 EMAIL_NOT_VERIFIED (replica/contracts/phase0b-auth.md §3).
   * Code outside the router (baseQuery, the SSE hook) raises it; <EmailVerificationRedirect>
   * consumes it and navigates to /verify-email with `state: { email }`.
   */
  verificationRequired:  { email: string | null } | null;
}

// A 256px sidebar leaves a phone ~120px for the chat, so start collapsed below `md`.
const isNarrowViewport = typeof window !== 'undefined' && window.innerWidth < 768;

const initialState: UiState = {
  sidebarOpen:           !isNarrowViewport,
  keyboardShortcutsOpen: false,
  mobileDrawerOpen:      false,
  isOnline:              typeof navigator !== 'undefined' ? navigator.onLine : true,
  toast:                 null,
  verificationRequired:  null,
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
    requireEmailVerification: (state, action: PayloadAction<{ email: string | null }>) => {
      state.verificationRequired = action.payload;
    },
    clearEmailVerificationRequired: (state) => { state.verificationRequired = null; },
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
  requireEmailVerification,
  clearEmailVerificationRequired,
} = uiSlice.actions;

export default uiSlice.reducer;
