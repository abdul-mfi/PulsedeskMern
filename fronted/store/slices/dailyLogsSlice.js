// store/slices/dailyLogsSlice.js
// Redux slice for daily logs — check-in, checkout, today summary, heatmap
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

// Thunks
export const checkin = createAsyncThunk('dailyLogs/checkin', async (payload, { rejectWithValue }) => {
  try { const { data } = await API.post('/daily-logs/checkin', payload); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Check-in failed'); }
});

export const checkout = createAsyncThunk('dailyLogs/checkout', async (payload, { rejectWithValue }) => {
  try { const { data } = await API.post('/daily-logs/checkout', payload); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Checkout failed'); }
});

export const fetchTodayLog = createAsyncThunk('dailyLogs/fetchToday', async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await API.get('/daily-logs', { params: { date: today } });
  return data.data?.find(l => l.user_id === userId) || null;
});

export const fetchTodaySummary = createAsyncThunk('dailyLogs/todaySummary', async () => {
  const { data } = await API.get('/daily-logs/today-summary');
  return data.data;
});

export const fetchWeekHeatmap = createAsyncThunk('dailyLogs/weekHeatmap', async (weekStart) => {
  const { data } = await API.get('/daily-logs/week-heatmap', { params: weekStart ? { week_start: weekStart } : {} });
  return data.data;
});

export const fetchLogs = createAsyncThunk('dailyLogs/fetchAll', async (params = {}) => {
  const { data } = await API.get('/daily-logs', { params });
  return data.data;
});

const dailyLogsSlice = createSlice({
  name: 'dailyLogs',
  initialState: {
    todayLog:      null,   // current user's log for today
    todaySummary:  null,   // manager view: who submitted today
    weekHeatmap:   null,   // weekly heatmap data
    list:          [],     // all logs (manager view)
    loading:       false,
    error:         null,
    checkedIn:     false,
    checkedOut:    false,
  },
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    // checkin
    b.addCase(checkin.pending,    (s) => { s.loading = true; s.error = null; })
     .addCase(checkin.fulfilled,  (s, { payload }) => { s.loading = false; s.todayLog = payload; s.checkedIn = true; })
     .addCase(checkin.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
    // checkout
     .addCase(checkout.pending,   (s) => { s.loading = true; s.error = null; })
     .addCase(checkout.fulfilled, (s, { payload }) => { s.loading = false; s.todayLog = payload; s.checkedOut = true; })
     .addCase(checkout.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })
    // today log
     .addCase(fetchTodayLog.fulfilled, (s, { payload }) => {
       s.todayLog  = payload;
       s.checkedIn  = !!payload;
       s.checkedOut = payload?.submission_status === 'COMPLETE';
     })
    // today summary
     .addCase(fetchTodaySummary.pending,   (s) => { s.loading = true; })
     .addCase(fetchTodaySummary.fulfilled, (s, { payload }) => { s.loading = false; s.todaySummary = payload; })
    // heatmap
     .addCase(fetchWeekHeatmap.pending,   (s) => { s.loading = true; })
     .addCase(fetchWeekHeatmap.fulfilled, (s, { payload }) => { s.loading = false; s.weekHeatmap = payload; })
    // list
     .addCase(fetchLogs.pending,   (s) => { s.loading = true; })
     .addCase(fetchLogs.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload; });
  },
});

export const { clearError } = dailyLogsSlice.actions;
export default dailyLogsSlice.reducer;
