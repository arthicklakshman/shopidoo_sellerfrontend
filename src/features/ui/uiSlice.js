import { createSlice } from '@reduxjs/toolkit';
const uiSlice = createSlice({
  name: 'ui',
  initialState: { themeMode: localStorage.getItem('sellerThemeMode') || 'light', toast: null, sidebarOpen: true },
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('sellerThemeMode', state.themeMode);
    },
    showToast: (state, action) => { state.toast = action.payload; },
    hideToast: (state) => { state.toast = null; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
  },
});
export const { toggleTheme, showToast, hideToast, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
