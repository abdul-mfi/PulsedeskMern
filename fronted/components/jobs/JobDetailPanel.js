// components/jobs/JobDetailPanel.js — COMPLETE FILE
// This is the slide panel that opens when a job is clicked
// Abdul: create this as components/jobs/JobDetailPanel.js
// Manager/Admin now see: Approve + Send Back buttons when job is IN_REVIEW
'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatusPill from '../ui/StatusPill';
import RingProgress from '../ui/RingProgress';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import {
  updateJob, acceptJob, rejectJob, completeJob,
  pauseJob, resumeJob, approveJob, rejectReview,
} from '../../store/slices/jobsSlice';
import { showToast } from '../../store/slices/uiSlice';
import { getDaysLeft, getStatusConfig } from '../../utils/jobStatus';
import { fmtDate, fmtRelative } from '../../utils/formatDate';
import API from '../../lib/api';

export default function JobDetailPanel({ job, onClose }) {
  const dispatch  = useDispatch();
  const { user }  = useSelector(s => s.auth);
  const [comment,    setComment]    = useState('');
  const [progress,   setProgress]   = useState(job?.progress || 0);
  const [submitting, setSubmitting] = useState(false);

  // Approve modal state
  const [approveOpen,  setApproveOpen]  = useState(false);
  const [rating,       setRating]       = useState(4);
  const [feedback,     setFeedback]     = useState('');

  // Reject review modal state
  const [rejectOpen,   setRejectOpen]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Reject job modal (employee rejecting initial assignment)
  const [rejectJobOpen,   setRejectJobOpen]   = useState(false);
  const [rejectJobReason, setRejectJobReason] = useState('');

  if (!job) return null;

  const cfg  = getStatusConfig(job.status);
  const days = getDaysLeft(job.due_date);
  const isManager  = ['ADMIN','MANAGER'].includes(user?.role);
  const isEmployee = user?.role === 'EMPLOYEE';
  const isMyJob    = job.assignee_id === user?.id;

  const act = async (fn, msg) => {
    setSubmitting(true);
    try { await fn(); dispatch(showToast({ message: msg, type: 'success' })); }
    catch (e) { dispatch(showToast({ message: e.response?.data?.message || 'Action failed', type: 'error' })); }
    finally { setSubmitting(false); }
  };

  const saveProgress = () => act(
    () => dispatch(updateJob({ id: job.id, progress })).unwrap(),
    'Progress updated'
  );

  const doAccept   = () => act(() => dispatch(acceptJob(job.id)).unwrap(), '✅ Job accepted — clock started!');
  const doComplete = () => act(() => dispatch(completeJob(job.id)).unwrap(), '📬 Submitted for review');
  const doPause    = () => act(() => dispatch(pauseJob(job.id)).unwrap(), 'Job paused');
  const doResume   = () => act(() => dispatch(resumeJob(job.id)).unwrap(), 'Job resumed');

  const doApprove = async () => {
    setSubmitting(true);
    try {
      await dispatch(approveJob({ id: job.id, rating, feedback })).unwrap();
      dispatch(showToast({ message: '✅ Job approved and marked complete!', type: 'success' }));
      setApproveOpen(false);
    } catch (e) {
      dispatch(showToast({ message: e.response?.data?.message || 'Approval failed', type: 'error' }));
    } finally { setSubmitting(false); }
  };

  const doRejectReview = async () => {
    if (!rejectReason.trim()) { dispatch(showToast({ message: 'Please give a reason', type: 'error' })); return; }
    setSubmitting(true);
    try {
      await dispatch(rejectReview({ id: job.id, reason: rejectReason })).unwrap();
      dispatch(showToast({ message: '🔄 Sent back for revision', type: 'success' }));
      setRejectOpen(false);
      setRejectReason('');
    } catch (e) {
      dispatch(showToast({ message: e.response?.data?.message || 'Failed', type: 'error' }));
    } finally { setSubmitting(false); }
  };

  const doRejectJob = async () => {
    if (!rejectJobReason.trim()) { dispatch(showToast({ message: 'Please give a reason', type: 'error' })); return; }
    await act(() => dispatch(rejectJob({ id: job.id, reason: rejectJobReason })).unwrap(), 'Job rejected');
    setRejectJobOpen(false);
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      await API.post(`/jobs/${job.id}/comments`, { content: comment });
      setComment('');
      dispatch(showToast({ message: 'Comment posted', type: 'success' }));
    } catch { dispatch(showToast({ message: 'Failed to post comment', type: 'error' })); }
  };

  const RATINGS = [1,2,3,4,5];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-white w-[520px] h-full shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-semibold text-gray-900 leading-snug">{job.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{job.client_name || 'No client'} · {job.type?.replace(/_/g,' ')}</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 shrink-0">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">

            {/* Status + countdown */}
            <div className="flex items-center gap-5 bg-gray-50 rounded-xl p-4 mb-5">
              <RingProgress percent={job.progress} color={cfg.color} size={72} strokeWidth={5} label={`${job.progress}%`} />
              <div>
                <StatusPill status={job.status} />
                <div className="text-2xl font-bold font-mono mt-2" style={{ color: days < 0 ? '#DC2626' : days <= 2 ? '#CA8A04' : '#0F1117' }}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days} days left`}
                </div>
                <div className="text-xs text-gray-400">Due {fmtDate(job.due_date)}</div>
              </div>
            </div>

            {/* ─── IN_REVIEW — MANAGER ACTIONS ─────────────────── */}
            {job.status === 'IN_REVIEW' && isManager && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  <span className="text-sm font-semibold text-purple-800">Awaiting your review</span>
                </div>
                <p className="text-xs text-purple-600 mb-4">
                  {job.assignee_name} has submitted this job for review. Approve to mark it complete, or send back with revision notes.
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1 justify-center" onClick={() => setApproveOpen(true)} disabled={submitting}>
                    ✅ Approve &amp; Mark Complete
                  </Button>
                  <Button variant="ghost" className="flex-1 justify-center" onClick={() => setRejectOpen(true)} disabled={submitting}>
                    🔄 Send Back for Revision
                  </Button>
                </div>
              </div>
            )}

            {/* ─── COMPLETE — show completion badge ────────────── */}
            {job.status === 'COMPLETE' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="text-sm font-semibold text-green-800">Job complete</div>
                  {job.completed_at && <div className="text-xs text-green-600">Completed {fmtRelative(job.completed_at)}</div>}
                </div>
              </div>
            )}

            {/* Progress slider — employee or manager can update when active */}
            {['ACTIVE','AT_RISK','OVERDUE'].includes(job.status) && (isMyJob || isManager) && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label">Progress</label>
                  <span className="text-xs font-mono font-semibold text-gray-600">{progress}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} step={5} value={progress}
                    onChange={e => setProgress(parseInt(e.target.value))}
                    className="flex-1 accent-brand" />
                  <Button size="sm" onClick={saveProgress} disabled={submitting || progress === job.progress}>Save</Button>
                </div>
              </div>
            )}

            {/* Employee actions on PENDING */}
            {job.status === 'PENDING' && isEmployee && isMyJob && (
              <div className="flex gap-2 mb-5">
                <Button className="flex-1 justify-center" onClick={doAccept} disabled={submitting}>✓ Accept Job — Start Clock</Button>
                <Button variant="ghost" onClick={() => setRejectJobOpen(true)} disabled={submitting}>Reject</Button>
              </div>
            )}

            {/* Employee: submit for review */}
            {['ACTIVE','AT_RISK'].includes(job.status) && isEmployee && isMyJob && (
              <Button className="w-full justify-center mb-5" onClick={doComplete} disabled={submitting}>
                📬 Submit for Manager Review
              </Button>
            )}

            {/* Manager: pause / resume */}
            {isManager && job.status === 'ACTIVE'  && <Button variant="ghost" size="sm" onClick={doPause}  className="mb-3">⏸ Pause Job</Button>}
            {isManager && job.status === 'PAUSED'  && <Button size="sm"          onClick={doResume} className="mb-3">▶ Resume Job</Button>}

            {/* Milestones */}
            {job.milestones?.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Milestones</div>
                <div className="flex flex-wrap gap-2">
                  {job.milestones.map((m, i) => (
                    <span key={m.id || i} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      m.status==='DONE'        ? 'bg-green-50 text-green-700 border-green-200' :
                      m.status==='IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200'   :
                                                  'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>{m.title}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Job meta */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Assigned to</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: job.assignee_color || '#4F46E5' }}>{job.assignee_initials}</div>
                  <span className="text-xs font-medium">{job.assignee_name}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Scope</div>
                <div className="text-xs font-mono font-semibold">{job.scope_hours}h · {job.working_days} days</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Priority</div>
                <div className={`text-xs font-semibold ${job.priority==='HIGH'?'text-red-600':job.priority==='MEDIUM'?'text-amber-600':'text-gray-500'}`}>{job.priority}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Created by</div>
                <div className="text-xs font-medium text-gray-700">{job.creator_name || '—'}</div>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="mb-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Description</div>
                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{job.description}</div>
              </div>
            )}

            {/* Comment box */}
            <div className="mb-5">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Add Comment</div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Write a comment…"
                  value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && postComment()} />
                <Button size="sm" onClick={postComment} disabled={!comment.trim()}>Post</Button>
              </div>
            </div>

            {/* Comments list */}
            {job.comments?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Comments ({job.comments.length})
                </div>
                <div className="flex flex-col gap-3">
                  {job.comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: c.user_color || '#4F46E5' }}>{c.user_initials}</div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                        <div className="text-xs font-medium text-gray-700">{c.user_name}</div>
                        <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{c.content}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{fmtRelative(c.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── APPROVE MODAL ────────────────────────────────────── */}
      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="Approve Job"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={doApprove} disabled={submitting}>
              {submitting ? 'Approving…' : '✅ Approve & Mark Complete'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-semibold text-green-800 mb-1">You are approving: {job.title}</div>
            <div className="text-xs text-green-600">This will move the job to COMPLETE and notify {job.assignee_name}.</div>
          </div>

          <div>
            <label className="label">Rate this delivery (1–5)</label>
            <div className="flex gap-2">
              {RATINGS.map(r => (
                <button key={r} onClick={() => setRating(r)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${rating === r ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {r} {'⭐'.repeat(r)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Feedback (optional — saved as comment)</label>
            <textarea className="input" rows={3}
              placeholder="e.g. Excellent work on the brand identity — the concept exploration was thorough and the final execution is clean…"
              value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* ─── REJECT REVIEW MODAL ──────────────────────────────── */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Send Back for Revision"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doRejectReview} disabled={submitting || !rejectReason.trim()}>
              {submitting ? 'Sending…' : '🔄 Send Back'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="font-semibold text-amber-800 mb-1">Sending back: {job.title}</div>
            <div className="text-xs text-amber-700">The job will move back to ACTIVE. {job.assignee_name} will be notified.</div>
          </div>
          <div>
            <label className="label">Reason for revision *</label>
            <textarea className="input" rows={3}
              placeholder="e.g. The logo mark needs more exploration — the current version is too similar to the competitor. Please revisit the brief section 2B…"
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* ─── REJECT JOB MODAL (Employee rejecting initial assignment) */}
      <Modal open={rejectJobOpen} onClose={() => setRejectJobOpen(false)} title="Reject Job Assignment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectJobOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doRejectJob} disabled={submitting}>Confirm Reject</Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600">You are rejecting <strong>{job.title}</strong>. Your manager will be notified and can reassign it.</div>
          <div>
            <label className="label">Reason *</label>
            <textarea className="input" rows={2}
              placeholder="e.g. Scope is unclear, I don't have the required skill set, already at capacity…"
              value={rejectJobReason} onChange={e => setRejectJobReason(e.target.value)} />
          </div>
        </div>
      </Modal>
    </>
  );
}
