import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/api";
export const fetchDaily = createAsyncThunk("reports/daily", async (p = {}) => {
  const { data } = await API.get("/reports/daily", { params: p });
  return data.data;
});
export const fetchWeekly = createAsyncThunk(
  "reports/weekly",
  async (p = {}) => {
    const { data } = await API.get("/reports/weekly", { params: p });
    return data.data;
  },
);
export const fetchMonthly = createAsyncThunk(
  "reports/monthly",
  async (p = {}) => {
    const { data } = await API.get("/reports/monthly", { params: p });
    return data.data;
  },
);
const s = createSlice({
  name: "reports",
  initialState: { daily: null, weekly: null, monthly: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDaily.pending, (s) => {s.loading = true})
      .addCase(fetchDaily.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.daily = payload;
      })
      .addCase(fetchWeekly.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.weekly = payload;
      })
      .addCase(fetchMonthly.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.monthly = payload;
      });
  },
});
export default s.reducer;
