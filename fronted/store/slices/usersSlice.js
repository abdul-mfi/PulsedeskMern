import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/api";
export const fetchUsers = createAsyncThunk("users/fetchAll", async (p = {}) => {
  const { data } = await API.get("/users", { params: p });
  return data.data;
});
export const fetchWorkload = createAsyncThunk(
  "users/fetchWorkload",
  async () => {
    const { data } = await API.get("/users/workload");
    return data.data;
  },
);
export const createUser = createAsyncThunk("users/create", async (p) => {
  const { data } = await API.post("/users", p);
  return data.data;
});
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, ...p }) => {
    const { data } = await API.patch(`/users/${id}`, p);
    return data.data;
  },
);
export const deleteUser = createAsyncThunk("users/delete", async (id) => {
  await API.delete(`/users/${id}`);
  return id;
});
const s = createSlice({
  name: "users",
  initialState: { list: [], workload: [], loading: false },
  reducers: {
    upsertUser: (s, { payload }) => {
      const i = s.list.findIndex((u) => u.id === payload.id);
      if (i >= 0) s.list[i] = payload;
      else s.list.unshift(payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchUsers.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchUsers.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.list = payload;
      })
      .addCase(fetchWorkload.fulfilled, (s, { payload }) => {
        s.workload = payload;
      })
      .addCase(createUser.fulfilled, (s, { payload }) =>
        s.list.unshift(payload),
      )
      .addCase(updateUser.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex((u) => u.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(
        deleteUser.fulfilled,
        (s, { payload }) => {s.list = s.list.filter((u) => u.id !== payload)}
      );
  },
});
export const { upsertUser } = s.actions;
export default s.reducer;
