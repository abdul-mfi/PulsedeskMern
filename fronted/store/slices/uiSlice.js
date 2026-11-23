import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    toast: null,
    activeModal: null,
    panelJob: null,
  },
  reducers: {
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
    },
    showToast: (s, { payload }) => {
      s.toast = payload;
    },
    hideToast: (s) => {
      s.toast = null;
    },
    openModal: (s, { payload }) => {
      s.activeModal = payload;
    },
    closeModal: (s) => {
      s.activeModal = null;
    },
    openPanel: (s, { payload }) => {
      s.panelJob = payload;
    },
    closePanel: (s) => {
      s.panelJob = null;
    },
  },
});
export const {
  toggleSidebar,
  showToast,
  hideToast,
  openModal,
  closeModal,
  openPanel,
  closePanel,
} = s.actions;
export default s.reducer;
