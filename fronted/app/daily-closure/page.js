// app/daily-closure/page.js — UPDATED: now shows real data from daily_logs
// Manager sees: who submitted, task details, can flag missed employees
// Data source: GET /api/reports/daily + GET /api/daily-logs/today-summary
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "../../components/layout/AppShell";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { fetchDaily } from "../../store/slices/reportsSlice";
import { fetchTodaySummary } from "../../store/slices/dailyLogsSlice";
import { createFlag } from "../../store/slices/hrSlice";
import { showToast } from "../../store/slices/uiSlice";
import { fmtTime } from "../../utils/formatDate";
import API from "../../lib/api";

const STATUS_STYLE = {
  COMPLETE: {
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
    badge: "text-green-700 bg-green-50 border-green-200",
    label: "✓ Submitted",
  },
  PARTIAL: {
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
    badge: "text-yellow-700 bg-yellow-50 border-yellow-200",
    label: "~ Partial",
  },
  MISSED: {
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
    badge: "text-red-700 bg-red-50 border-red-200",
    label: "✕ Not submitted",
  },
};

function FlagModal({ person, open, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    reason: "",
    severity: "ADVISORY",
    details: "",
    recommended_action: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.reason.trim()) {
      dispatch(showToast({ message: "Reason required", type: "error" }));
      return;
    }
    try {
      await dispatch(
        createFlag({ flagged_person_id: person.id, ...form }),
      ).unwrap();
      dispatch(
        showToast({
          message: `${person.name} has been flagged`,
          type: "success",
        }),
      );
      onClose();
    } catch {
      dispatch(showToast({ message: "Failed", type: "error" }));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`🚩 Flag ${person?.name || "Employee"} to HR`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit}>
            Submit Flag
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Reason *</label>
          <select
            className="input"
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
          >
            <option value="">Select a reason</option>
            <option value="Missed daily report submission">
              Missed daily report submission
            </option>
            <option value="Repeated non-submission">
              Repeated non-submission (3+ days)
            </option>
            <option value="Low productivity hours logged">
              Low productivity hours logged
            </option>
            <option value="Pattern of partial submissions">
              Pattern of partial submissions
            </option>
            <option value="Other">Other (see details)</option>
          </select>
        </div>
        <div>
          <label className="label">Severity</label>
          <select
            className="input"
            value={form.severity}
            onChange={(e) => set("severity", e.target.value)}
          >
            <option value="ADVISORY">Advisory — first notice</option>
            <option value="WARNING">Warning — formal record</option>
            <option value="SERIOUS">Serious — escalation</option>
          </select>
        </div>
        <div>
          <label className="label">Details</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Additional context for HR…"
            value={form.details}
            onChange={(e) => set("details", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Recommended Action</label>
          <input
            className="input"
            placeholder="e.g. Schedule 1:1, issue formal warning…"
            value={form.recommended_action}
            onChange={(e) => set("recommended_action", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

function LogDetailModal({ member, open, onClose }) {
  if (!member?.log) return null;
  const log = member.log;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${member.user.name}'s Day — ${new Date(log.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`}
      size="lg"
    >
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Check-in</div>
          <div className="font-mono font-semibold text-sm">
            {fmtTime(log.check_in_time) || "—"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Check-out</div>
          <div className="font-mono font-semibold text-sm">
            {fmtTime(log.check_out_time) || "—"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Productive Hours</div>
          <div className="font-mono font-semibold text-sm">
            {log.productive_hours || "—"}h
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Day Rating</div>
          <div className="font-mono font-semibold text-sm">
            {"⭐".repeat(log.day_rating || 0)} {log.day_rating || "—"}/5
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Work Mode</div>
          <div className="text-sm font-medium">
            {log.work_mode?.replace(/_/g, " ") || "—"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 mb-0.5">Mood</div>
          <div className="text-sm font-medium">
            {"😩😕😐🙂🤩".split("")[log.mood_score - 1] || "—"} {log.mood_score}
            /5
          </div>
        </div>
      </div>

      {log.top_goals && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Top Goals
          </div>
          <div className="text-sm text-gray-700 bg-blue-50 rounded-xl px-4 py-3">
            {log.top_goals}
          </div>
        </div>
      )}
      {log.blockers && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Blockers
          </div>
          <div className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
            {log.blockers}
          </div>
        </div>
      )}
      {log.accomplishments && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Accomplishments
          </div>
          <div className="text-sm text-gray-700 bg-green-50 rounded-xl px-4 py-3">
            {log.accomplishments}
          </div>
        </div>
      )}
      {log.pending_work && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Pending / Carried Forward
          </div>
          <div className="text-sm text-gray-700 bg-yellow-50 rounded-xl px-4 py-3">
            {log.pending_work}
          </div>
        </div>
      )}
      {log.tomorrow_plan && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Tomorrow's Plan
          </div>
          <div className="text-sm text-gray-700 bg-purple-50 rounded-xl px-4 py-3">
            {log.tomorrow_plan}
          </div>
        </div>
      )}
      {log.flag_to_manager && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            🚩 Flag to Manager
          </div>
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
            {log.flag_to_manager}
          </div>
        </div>
      )}

      {log.challenges && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
            Challenges
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
            {log.challenges}
          </div>
        </div>
      )}

      {member.task_logs?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Task Breakdown
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-gray-400">Task</th>
                <th className="px-3 py-2 text-gray-400 text-center">Planned</th>
                <th className="px-3 py-2 text-gray-400 text-center">Actual</th>
                <th className="px-3 py-2 text-gray-400 text-center">Done %</th>
                <th className="px-3 py-2 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {member.task_logs.map((t, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {t.task_name}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-500 font-mono">
                    {t.planned_hours}h
                  </td>
                  <td className="px-3 py-2 text-center text-gray-700 font-mono font-semibold">
                    {t.actual_hours}h
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`font-semibold ${t.completion >= 80 ? "text-green-600" : t.completion >= 50 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {t.completion}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

function DailyClosureContent() {
  const dispatch = useDispatch();
  const { daily, loading } = useSelector((s) => s.reports);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flagPerson, setFlagPerson] = useState(null);
  const [detailMember, setDetailMember] = useState(null);

  useEffect(() => {
    dispatch(fetchDaily({ date }));
  }, [dispatch, date]);

  const d = daily;

  return (
    <div className="p-6">
      {/* Date + summary */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-44"
        />
        {d && (
          <div className="flex gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-green-600">
                {d.summary?.submitted || 0}
              </div>
              <div className="text-[10px] text-green-600 mt-0.5">Submitted</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-yellow-600">
                {d.summary?.partial || 0}
              </div>
              <div className="text-[10px] text-yellow-600 mt-0.5">Partial</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-red-600">
                {d.summary?.missed || 0}
              </div>
              <div className="text-[10px] text-red-600 mt-0.5">Missed</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-gray-700">
                {d.summary?.total || 0}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Total team</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-indigo-600">
                {d.summary?.avg_efficiency || 0}%
              </div>
              <div className="text-[10px] text-indigo-600 mt-0.5">
                Avg efficiency
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Missed alert */}
      {d?.members?.filter((m) => m.status === "MISSED").length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-600 font-semibold text-sm">
              ⚠ {d.members.filter((m) => m.status === "MISSED").length} member
              {d.members.filter((m) => m.status === "MISSED").length > 1
                ? "s"
                : ""}{" "}
              did not submit today
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {d.members
              .filter((m) => m.status === "MISSED")
              .map((m) => (
                <div
                  key={m.user.id}
                  className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-1.5"
                >
                  <Avatar user={m.user} size="sm" />
                  <span className="text-xs font-medium text-gray-700">
                    {m.user.name}
                  </span>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => setFlagPerson(m.user)}
                  >
                    🚩 Flag
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Member cards */}
      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Loading report…
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {d?.members?.map((m) => {
          const style = STATUS_STYLE[m.status] || STATUS_STYLE.MISSED;
          return (
            <div
              key={m.user.id}
              className={`card border-2 p-4 cursor-pointer hover:shadow-sm transition-all ${style.bg}`}
              onClick={() => (m.log ? setDetailMember(m) : null)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Avatar user={m.user} size="md" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {m.user.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {m.user.designation}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${style.badge}`}
                >
                  {style.label}
                </span>
              </div>

              {m.log ? (
                <>
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-white/70 rounded-lg py-1.5 text-center">
                      <div className="text-sm font-bold font-mono text-gray-800">
                        {fmtTime(m.log.check_in_time) || "—"}
                      </div>
                      <div className="text-[9px] text-gray-400">Check-in</div>
                    </div>
                    <div className="bg-white/70 rounded-lg py-1.5 text-center">
                      <div className="text-sm font-bold font-mono text-gray-800">
                        {m.log.productive_hours || "—"}h
                      </div>
                      <div className="text-[9px] text-gray-400">Hours</div>
                    </div>
                    <div className="bg-white/70 rounded-lg py-1.5 text-center">
                      <div className="text-sm font-bold font-mono text-gray-800">
                        {m.task_count || 0}
                      </div>
                      <div className="text-[9px] text-gray-400">Tasks</div>
                    </div>
                    <div className="bg-white/70 rounded-lg py-1.5 text-center">
                      <div className="text-sm font-bold font-mono text-gray-800">
                        {"⭐".repeat(m.log.day_rating || 0) || "—"}
                      </div>
                      <div className="text-[9px] text-gray-400">Rating</div>
                    </div>
                  </div>
                  {m.log.top_goals && (
                    <div className="text-xs text-gray-600 mb-1.5 line-clamp-2">
                      <span className="font-medium text-gray-400">Goals: </span>
                      {m.log.top_goals}
                    </div>
                  )}
                  {m.log.blockers && (
                    <div className="text-xs text-red-600 mb-1.5 line-clamp-1">
                      <span className="font-medium">⚠ Blocker: </span>
                      {m.log.blockers}
                    </div>
                  )}
                  {m.log.flag_to_manager && (
                    <div className="text-xs text-red-700 font-medium bg-red-100 border border-red-200 rounded-lg px-2 py-1">
                      🚩 {m.log.flag_to_manager}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-2 text-right">
                    Click to view full log →
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-1">📭</div>
                  <div className="text-xs text-gray-400">No submission yet</div>
                  <Button
                    size="xs"
                    variant="danger"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlagPerson(m.user);
                    }}
                  >
                    🚩 Flag to HR
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {flagPerson && (
        <FlagModal
          person={flagPerson}
          open={!!flagPerson}
          onClose={() => setFlagPerson(null)}
        />
      )}
      {detailMember && (
        <LogDetailModal
          member={detailMember}
          open={!!detailMember}
          onClose={() => setDetailMember(null)}
        />
      )}
    </div>
  );
}

export default function DailyClosurePage() {
  return (
    <>
      <Topbar title="Daily Closure Report" />
      <DailyClosureContent />
    </>
  );
}
