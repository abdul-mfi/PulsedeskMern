import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/api";
export const fetchClients = createAsyncThunk("clients/fetchAll", async () => {
  const { data } = await API.get("/clients");
  return data.data;
});
export const createClient = createAsyncThunk("clients/create", async (p) => {
  const { data } = await API.post("/clients", p);
  return data.data;
});
export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, ...p }) => {
    const { data } = await API.patch(`/clients/${id}`, p);
    return data.data;
  },
);
export const deleteClient = createAsyncThunk("clients/delete", async (id) => {
  await API.delete(`/clients/${id}`);
  return id;
});
const s = createSlice({
  name: "clients",
  initialState: { list: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchClients.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchClients.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.list = payload;
      })
      .addCase(createClient.fulfilled, (s, { payload }) =>
        s.list.unshift(payload),
      )
      .addCase(updateClient.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex((c) => c.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deleteClient.fulfilled, (s, { payload }) => {
      s.list = s.list.filter((c) => c.id !== payload);
      });
  },
});
export default s.reducer;
