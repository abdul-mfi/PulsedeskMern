import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/api";
export const fetchNotifs = createAsyncThunk("notifs/fetchAll", async () => {
  const { data } = await API.get("/notifications");
  return data.data;
});
export const fetchUnread = createAsyncThunk("notifs/unread", async () => {
  const { data } = await API.get("/notifications/unread-count");
  return data.data.count;
});
export const markRead = createAsyncThunk("notifs/markRead", async (id) => {
  await API.patch(`/notifications/${id}/read`);
  return id;
});
export const markAllRead = createAsyncThunk("notifs/markAllRead", async () => {
  await API.patch("/notifications/read-all");
});
const s = createSlice({
  name: "notifications",
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotif: (s, { payload }) => {
      s.list.unshift(payload);
      s.unreadCount++;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifs.fulfilled, (s, { payload }) => {
      s.list = payload;
    })
      .addCase(fetchUnread.fulfilled, (s, { payload }) => {
        s.unreadCount = payload;
      })
      .addCase(markRead.fulfilled, (s, { payload }) => {
        const n = s.list.find((x) => x.id === payload);
        if (n && !n.is_read) {
          n.is_read = true;
          s.unreadCount = Math.max(0, s.unreadCount - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.list.forEach((n) => (n.is_read = true));
        s.unreadCount = 0;
      });
  },
});
export const { addNotif } = s.actions;
export default s.reducer;
