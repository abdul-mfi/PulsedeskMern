"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "../../components/layout/AppShell";
import Topbar from "../../components/layout/Topbar";
import StatusPill from "../../components/ui/StatusPill";
import RingProgress from "../../components/ui/RingProgress";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import {
  fetchJobs,
  fetchStats,
  createJob,
  acceptJob,
  rejectJob,
  completeJob,
  deleteJob,
  updateJob,
} from "../../store/slices/jobsSlice";
import { fetchUsers } from "../../store/slices/usersSlice";
import { fetchClients } from "../../store/slices/clientsSlice";
import { showToast, openPanel } from "../../store/slices/uiSlice";
import { getDaysLeft, getStatusConfig } from "../../utils/jobStatus";
import { fmtDate } from "../../utils/formatDate";

import JobDetailPanel from "../../components/jobs/JobDetailPanel";


import API from "../../lib/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "On Track" },
  { key: "AT_RISK", label: "At Risk" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "PAUSED", label: "Paused" },
  { key: "COMPLETE", label: "Complete" },
];

const TYPES = [
  "DESIGN",
  "DEVELOPMENT",
  "ANIMATION",
  "COPYWRITING",
  "VIDEO_EDITING",
  "PERFORMANCE_MARKETING",
  "SMM",
  "STRATEGY",
  "RESEARCH",
  "REPORTING",
  "OTHER",
];

const EMPTY_JOB = {
  title: "",
  description: "",
  type: "OTHER",
  priority: "MEDIUM",
  client_id: "",
  assignee_id: "",
  scope_hours: "",
  working_days: "7",
  due_date: "",
  milestones: "",
};

function NewJobModal({ open, onClose }) {
  const dispatch = useDispatch();
  const { list: clients } = useSelector((s) => s.clients);
  const { list: users } = useSelector((s) => s.users);
  const [form, setForm] = useState(EMPTY_JOB);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const autoDeadline = () => {
    if (!form.working_days) return;
    const d = new Date();
    let count = 0,
      days = parseInt(form.working_days);
    while (count < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    set("due_date", d.toISOString().slice(0, 10));
  };

  const submit = async () => {
    if (
      !form.title ||
      !form.assignee_id ||
      !form.scope_hours ||
      !form.due_date
    ) {
      dispatch(
        showToast({ message: "Fill all required fields", type: "error" }),
      );
      return;
    }
    setLoading(true);
    try {
      await dispatch(createJob(form)).unwrap();
      dispatch(
        showToast({ message: "Job created successfully", type: "success" }),
      );
      setForm(EMPTY_JOB);
      onClose();
    } catch (e) {
      dispatch(
        showToast({ message: e || "Failed to create job", type: "error" }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Job"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating…" : "Create Job"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Job Title *</label>
          <input
            className="input"
            placeholder="e.g. Brand Identity – Afia"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Client</label>
          <select
            className="input"
            value={form.client_id}
            onChange={(e) => set("client_id", e.target.value)}
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assign To *</label>
          <select
            className="input"
            value={form.assignee_id}
            onChange={(e) => set("assignee_id", e.target.value)}
          >
            <option value="">Select employee</option>
            {users
              .filter((u) => u.role === "EMPLOYEE" || u.role === "MANAGER")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="label">Job Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div>
          <label className="label">Scope Hours *</label>
          <input
            className="input"
            type="number"
            placeholder="84"
            value={form.scope_hours}
            onChange={(e) => set("scope_hours", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Working Days</label>
          <div className="flex gap-2">
            <input
              className="input"
              type="number"
              placeholder="7"
              value={form.working_days}
              onChange={(e) => set("working_days", e.target.value)}
            />
            <button
              onClick={autoDeadline}
              className="px-3 py-2 bg-brand-light text-brand text-xs rounded-lg whitespace-nowrap border border-brand/20 hover:bg-brand/10"
            >
              Auto date
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="label">Deadline *</label>
          <input
            className="input"
            type="date"
            value={form.due_date}
            onChange={(e) => set("due_date", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="label">Milestones (comma separated)</label>
          <input
            className="input"
            placeholder="Research, Design, Review, Delivery"
            value={form.milestones}
            onChange={(e) => set("milestones", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Job scope and requirements…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

function JobsContent() {
  const dispatch = useDispatch();
  const { list: jobs, stats, loading } = useSelector((s) => s.jobs);
  const { user } = useSelector((s) => s.auth);
  const [filter, setFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchStats());
    dispatch(fetchUsers());
    dispatch(fetchClients());
  }, [dispatch]);

  const openDetail = async (job) => {
    try {
      const { data } = await API.get(`/jobs/${job.id}`);
      setSelectedJob(data.data);
    } catch {
      setSelectedJob(job);
    }
  };

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const canCreate = ["ADMIN", "MANAGER"].includes(user?.role);

  const COUNTS = {
    all: jobs.length,
    ACTIVE: stats?.active || 0,
    AT_RISK: stats?.at_risk || 0,
    OVERDUE: stats?.overdue || 0,
    PENDING: stats?.pending || 0,
    IN_REVIEW: stats?.in_review || 0,
    PAUSED: stats?.paused || 0,
    COMPLETE: stats?.complete || 0,
  };

  return (
    <div className="p-6">

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => {
          const cfg = getStatusConfig(f.key === "all" ? "PAUSED" : f.key);
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
            >
              {f.label}
              <span
                className={`text-[10px] font-mono ml-0.5 ${active ? "text-white/70" : "text-gray-400"}`}
              >
                {COUNTS[f.key] || 0}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex gap-2">
          {canCreate && (
            <Button onClick={() => setNewOpen(true)}>+ New Job</Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Job Title
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Assignee
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Progress
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                  Deadline
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    Loading jobs…
                  </td>
                </tr>
              )}
              {!loading && !filtered.length && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No jobs match this filter
                  </td>
                </tr>
              )}
              {filtered.map((job) => {
                const cfg = getStatusConfig(job.status);
                const days = getDaysLeft(job.due_date);
                const PCOLOR = {
                  HIGH: "text-red-600 bg-red-50 border-red-200",
                  MEDIUM: "text-amber-600 bg-amber-50 border-amber-200",
                  LOW: "text-gray-500 bg-gray-50 border-gray-200",
                };
                return (
                  <tr
                    key={job.id}
                    onClick={() => openDetail(job)}
                    className="border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900 leading-snug">
                        {job.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.type?.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {job.client_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{
                            background: job.assignee_color || "#4F46E5",
                          }}
                        >
                          {job.assignee_initials}
                        </div>
                        <span className="text-xs">
                          {job.assignee_name?.split(" ")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PCOLOR[job.priority]}`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${job.progress}%`,
                              background: cfg.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-500">
                          {job.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="text-xs font-mono font-semibold"
                        style={{
                          color:
                            days < 0
                              ? "#DC2626"
                              : days <= 2
                                ? "#CA8A04"
                                : "#374151",
                        }}
                      >
                        {days < 0
                          ? `${Math.abs(days)}d over`
                          : days === 0
                            ? "Today"
                            : `${days}d left`}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {fmtDate(job.due_date, {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canCreate && (
                        <button
                          onClick={() => dispatch(deleteJob(job.id))}
                          className="text-gray-300 hover:text-red-400 text-sm px-2 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewJobModal open={newOpen} onClose={() => setNewOpen(false)} />
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <>
      <Topbar title="All Jobs" />
      <JobsContent />
    </>
  );
}
