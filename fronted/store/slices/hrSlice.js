// store/slices/hrSlice.js
// Redux slice for HR flags and award nominations
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../lib/api';

// HR Flags
export const fetchFlags    = createAsyncThunk('hr/fetchFlags',    async (p={}) => { const { data } = await API.get('/hr/flags', { params: p }); return data.data; });
export const createFlag    = createAsyncThunk('hr/createFlag',    async (payload) => { const { data } = await API.post('/hr/flags', payload); return data.data; });
export const updateFlag    = createAsyncThunk('hr/updateFlag',    async ({ id, ...payload }) => { const { data } = await API.patch(`/hr/flags/${id}`, payload); return data.data; });
export const deleteFlag    = createAsyncThunk('hr/deleteFlag',    async (id) => { await API.delete(`/hr/flags/${id}`); return id; });

// Awards
export const fetchAwards   = createAsyncThunk('hr/fetchAwards',   async (p={}) => { const { data } = await API.get('/hr/awards', { params: p }); return data.data; });
export const nominate      = createAsyncThunk('hr/nominate',      async (payload) => { const { data } = await API.post('/hr/awards/nominate', payload); return data.data; });
export const updateAward   = createAsyncThunk('hr/updateAward',   async ({ id, ...payload }) => { const { data } = await API.patch(`/hr/awards/${id}`, payload); return data.data; });

const hrSlice = createSlice({
  name: 'hr',
  initialState: {
    flags:   [],
    awards:  [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (b) => {
    b
    // flags
    .addCase(fetchFlags.pending,    (s)       => { s.loading = true; })
    .addCase(fetchFlags.fulfilled,  (s, { payload }) => { s.loading = false; s.flags = payload; })
    .addCase(createFlag.fulfilled,  (s, { payload }) => { s.flags.unshift(payload); })
    .addCase(updateFlag.fulfilled,  (s, { payload }) => { const i = s.flags.findIndex(f=>f.id===payload.id); if(i>=0) s.flags[i]=payload; })
    .addCase(deleteFlag.fulfilled,  (s, { payload }) => { s.flags = s.flags.filter(f=>f.id!==payload); })
    // awards
    .addCase(fetchAwards.pending,   (s)       => { s.loading = true; })
    .addCase(fetchAwards.fulfilled, (s, { payload }) => { s.loading = false; s.awards = payload; })
    .addCase(nominate.fulfilled,    (s, { payload }) => { s.awards.unshift(payload); })
    .addCase(updateAward.fulfilled, (s, { payload }) => { const i = s.awards.findIndex(a=>a.id===payload.id); if(i>=0) s.awards[i]=payload; });
  },
});

export default hrSlice.reducer;
