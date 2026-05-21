import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: [],
  loading: false,
  error: null,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    alertStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAlertsSuccess: (state, action) => {
      state.loading = false;
      state.alerts = action.payload;
    },
    createAlertSuccess: (state, action) => {
      state.loading = false;
      const index = state.alerts.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      } else {
        state.alerts.push(action.payload);
      }
    },
    deleteAlertSuccess: (state, action) => {
      state.loading = false;
      state.alerts = state.alerts.filter(a => a._id !== action.payload);
    },
    alertFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  alertStart,
  fetchAlertsSuccess,
  createAlertSuccess,
  deleteAlertSuccess,
  alertFailure,
} = alertSlice.actions;

export default alertSlice.reducer;
