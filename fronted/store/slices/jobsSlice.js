// store/slices/jobsSlice.js — COMPLETE UPDATED FILE
// Abdul: replace your existing jobsSlice.js with this — adds approveJob + rejectReview thunks
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/api";

// ─── THUNKS ──────────────────────────────────────────────────────────
export const fetchJobs = createAsyncThunk(
  "jobs/fetchAll",
  async (params = {}) => {
    const { data } = await API.get("/jobs", { params });
    return data.data;
  },
);
export const fetchStats = createAsyncThunk("jobs/fetchStats", async () => {
  const { data } = await API.get("/jobs/stats");
  return data.data;
});
export const fetchJob = createAsyncThunk("jobs/fetchOne", async (id) => {
  const { data } = await API.get(`/jobs/${id}`);
  return data.data;
});
export const createJob = createAsyncThunk("jobs/create", async (payload) => {
  const { data } = await API.post("/jobs", payload);
  return data.data;
});
export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, ...p }) => {
    const { data } = await API.patch(`/jobs/${id}`, p);
    return data.data;
  },
);
export const deleteJob = createAsyncThunk("jobs/delete", async (id) => {
  await API.delete(`/jobs/${id}`);
  return id;
});

// Employee actions
export const acceptJob = createAsyncThunk("jobs/accept", async (id) => {
  const { data } = await API.post(`/jobs/${id}/accept`);
  return data.data;
});
export const rejectJob = createAsyncThunk(
  "jobs/reject",
  async ({ id, reason }) => {
    const { data } = await API.post(`/jobs/${id}/reject`, { reason });
    return data.data;
  },
);
export const completeJob = createAsyncThunk("jobs/complete", async (id) => {
  const { data } = await API.post(`/jobs/${id}/complete`);
  return data.data;
});

// Manager/Admin actions
export const pauseJob = createAsyncThunk("jobs/pause", async (id) => {
  const { data } = await API.post(`/jobs/${id}/pause`);
  return data.data;
});
export const resumeJob = createAsyncThunk("jobs/resume", async (id) => {
  const { data } = await API.post(`/jobs/${id}/resume`);
  return data.data;
});

// ─── NEW: Manager approves job from IN_REVIEW → COMPLETE
export const approveJob = createAsyncThunk(
  "jobs/approve",
  async ({ id, rating, feedback }) => {
    const { data } = await API.post(`/jobs/${id}/approve`, {
      rating,
      feedback,
    });
    return data.data;
  },
);

// ─── NEW: Manager rejects review — sends back to ACTIVE
export const rejectReview = createAsyncThunk(
  "jobs/rejectReview",
  async ({ id, reason }) => {
    const { data } = await API.post(`/jobs/${id}/reject-review`, { reason });
    return data.data;
  },
);

// ─── SLICE ───────────────────────────────────────────────────────────
const upsert = (list, item) => {
  const i = list.findIndex((j) => j.id === item.id);
  if (i >= 0) list[i] = item;
  else list.unshift(item);
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    list: [],
    selected: null,
    stats: null,
    loading: false,
    error: null,
    filter: "all",
  },
  reducers: {
    setFilter: (s, { payload }) => {
      s.filter = payload;
    },
    setSelected: (s, { payload }) => {
      s.selected = payload;
    },
    upsertJob: (s, { payload }) => {
      upsert(s.list, payload);
      if (s.selected?.id === payload.id) s.selected = payload;
    },
    removeJob: (s, { payload }) => {
      s.list = s.list.filter((j) => j.id !== payload);
    },
    updateStatus: (s, { payload: { jobId, status } }) => {
      const j = s.list.find((x) => x.id === jobId);
      if (j) j.status = status;
      if (s.selected?.id === jobId) s.selected.status = status;
    },
  },
  extraReducers: (b) => {
    const handled = [
      fetchJobs,
      fetchStats,
      fetchJob,
      createJob,
      updateJob,
      deleteJob,
      acceptJob,
      rejectJob,
      completeJob,
      pauseJob,
      resumeJob,
      approveJob,
      rejectReview,
    ];

    b.addCase(fetchJobs.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchJobs.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.list = payload;
      })
      .addCase(fetchJobs.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })

      .addCase(fetchStats.fulfilled, (s, { payload }) => {
        s.stats = payload;
      })
      .addCase(fetchJob.fulfilled, (s, { payload }) => {
        s.selected = payload;
      })

      .addCase(createJob.fulfilled, (s, { payload }) => {
        s.list.unshift(payload);
        if (s.stats) s.stats.total++;
      })
      .addCase(deleteJob.fulfilled, (s, { payload }) => {
        s.list = s.list.filter((j) => j.id !== payload);
      });

    // All update-type thunks — upsert into list + update selected
    [
      updateJob,
      acceptJob,
      rejectJob,
      completeJob,
      pauseJob,
      resumeJob,
      approveJob,
      rejectReview,
    ].forEach((thunk) => {
      b.addCase(thunk.pending, (s) => {
        s.loading = true;
      })
        .addCase(thunk.fulfilled, (s, { payload }) => {
          s.loading = false;
          upsert(s.list, payload);
          if (s.selected?.id === payload.id) s.selected = payload;
        })
        .addCase(thunk.rejected, (s, { payload }) => {
          s.loading = false;
          s.error = payload;
        });
    });
  },
});

export const { setFilter, setSelected, upsertJob, removeJob, updateStatus } =
  jobsSlice.actions;
export default jobsSlice.reducer;
