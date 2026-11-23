import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login as doLogin, logout as doLogout, getUser } from "../../lib/auth";
import API from "../../lib/api";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await doLogin(email, password);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Login failed");
    }
  },
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await doLogout();
});

export const fetchMe = createAsyncThunk("auth/me", async () => {
  const { data } = await API.get("/auth/me");
  return data.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(loginThunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user = payload.user;
      })
      .addCase(loginThunk.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
      })
      // FETCH CURRENT USER
      .addCase(fetchMe.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMe.fulfilled, (s, { payload }) => {
        s.user = payload;
      })
      .addCase(fetchMe.rejected, (s) => {
        s.loading = false;
        s.user = null;
      });
  },
});

export default authSlice.reducer;
