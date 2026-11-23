'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import StatusPill from '../../components/ui/StatusPill';
import { fetchJobs } from '../../store/slices/jobsSlice';
import { getDaysLeft, getStatusConfig } from '../../utils/jobStatus';
import { fmtDate } from '../../utils/formatDate';
import API from '../../lib/api';

const COLUMNS = [
  { key:'PENDING',   label:'Pending',   color:'#2563EB', bg:'bg-blue-50',   border:'border-blue-200' },
  { key:'ACTIVE',    label:'On Track',  color:'#16A34A', bg:'bg-green-50',  border:'border-green-200' },
  { key:'AT_RISK',   label:'At Risk',   color:'#CA8A04', bg:'bg-yellow-50', border:'border-yellow-200' },
  { key:'IN_REVIEW', label:'In Review', color:'#7C3AED', bg:'bg-purple-50', border:'border-purple-200' },
  { key:'OVERDUE',   label:'Overdue',   color:'#DC2626', bg:'bg-red-50',    border:'border-red-200' },
];

function KanbanCard({ job, onClick }) {
  const cfg = getStatusConfig(job.status);
  const days = getDaysLeft(job.due_date);
  return (
    <div onClick={() => onClick(job)} className="bg-white border border-gray-200 rounded-xl p-3.5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Client logo + job type */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-gray-400 font-medium">{job.type?.replace(/_/g,' ')}</span>
        <span className={`text-[10px] font-semibold ${job.priority==='HIGH'?'text-red-500':job.priority==='MEDIUM'?'text-amber-500':'text-gray-400'}`}>{job.priority}</span>
      </div>
      {/* Title */}
      <div className="font-semibold text-sm text-gray-900 leading-snug mb-1">{job.title}</div>
      <div className="text-xs text-gray-400 mb-3">{job.client_name}</div>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2.5">
        <div className="h-full rounded-full transition-all" style={{ width:`${job.progress}%`, background:cfg.color }} />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: job.assignee_color || '#4F46E5' }}>{job.assignee_initials}</div>
          <span className="text-[10px] text-gray-500">{job.assignee_name?.split(' ')[0]}</span>
        </div>
        <span className="text-[10px] font-mono font-semibold" style={{ color: days<0?'#DC2626':days<=2?'#CA8A04':'#6B7280' }}>
          {days<0?`${Math.abs(days)}d over`:days===0?'Today':`${days}d`}
        </span>
      </div>
    </div>
  );
}

function KanbanContent() {
  const dispatch = useDispatch();
  const { list: jobs, loading } = useSelector(s => s.jobs);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const openDetail = async (job) => {
    try { const { data } = await API.get(`/jobs/${job.id}`); setSelectedJob(data.data); }
    catch { setSelectedJob(job); }
  };

  return (
    <div className="p-6 h-full">
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight:'calc(100vh - 120px)' }}>
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.key);
          return (
            <div key={col.key} className="flex flex-col w-72 shrink-0">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${col.bg} border ${col.border}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background:col.color }}></span>
                  <span className="text-xs font-semibold" style={{ color:col.color }}>{col.label}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color:col.color }}>{colJobs.length}</span>
              </div>
              {/* Cards */}
              <div className="flex flex-col gap-2.5 flex-1">
                {loading && <div className="text-xs text-gray-400 text-center py-6">Loading…</div>}
                {!loading && colJobs.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-xs text-gray-300">No jobs</div>
                )}
                {colJobs.map(job => <KanbanCard key={job.id} job={job} onClick={openDetail} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel (reuse same slide panel pattern) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={e=>e.target===e.currentTarget&&setSelectedJob(null)}>
          <div className="bg-white w-96 h-full shadow-2xl border-l border-gray-100 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div><div className="font-semibold">{selectedJob.title}</div><div className="text-xs text-gray-400">{selectedJob.client_name}</div></div>
              <button onClick={()=>setSelectedJob(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <StatusPill status={selectedJob.status} />
            <div className="mt-4 text-sm text-gray-600 font-mono">
              <div>Progress: {selectedJob.progress}%</div>
              <div>Due: {fmtDate(selectedJob.due_date)}</div>
              <div>Assignee: {selectedJob.assignee_name}</div>
              <div>Scope: {selectedJob.scope_hours}h</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KanbanPage() {
  return <><Topbar title="Kanban Board" /><KanbanContent /></>;
}
