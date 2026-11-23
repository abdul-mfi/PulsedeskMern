'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import StatCard from '../../components/ui/StatCard';
import StatusPill from '../../components/ui/StatusPill';
import RingProgress from '../../components/ui/RingProgress';
import Button from '../../components/ui/Button';
import { fetchJobs, fetchStats, completeJob, acceptJob } from '../../store/slices/jobsSlice';
import { fetchNotifs, fetchUnread } from '../../store/slices/notificationsSlice';
import { showToast, openPanel } from '../../store/slices/uiSlice';
import { getDaysLeft, getStatusConfig } from '../../utils/jobStatus';
import { fmtDate } from '../../utils/formatDate';

function AIInsight({ jobs, stats }) {
  const overdue  = jobs.filter(j=>j.status==='OVERDUE');
  const atRisk   = jobs.filter(j=>j.status==='AT_RISK');
  const pending  = jobs.filter(j=>j.status==='PENDING');
  const onTrack  = stats ? Math.round(((stats.active||0) / Math.max(stats.total||1, 1)) * 100) : 0;

  return (
    <div className="bg-brand-light border border-brand/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-brand text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider">AI</span>
        <span className="font-semibold text-brand text-sm">Pulse Insight — Today</span>
        <span className="text-[10px] text-brand/50 ml-auto">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        {overdue.length > 0
          ? <><strong className="text-red-600">{overdue.length} job{overdue.length>1?'s':''} overdue</strong> — {overdue.slice(0,3).map(j=>j.title).join(', ')}{overdue.length>3?` +${overdue.length-3} more`:''}. Immediate action required. </>
          : <span className="text-green-600">✓ No overdue jobs. </span>}
        {atRisk.length > 0 && <><strong className="text-amber-600">{atRisk.length} job{atRisk.length>1?'s':''} at risk</strong> of missing deadline. </>}
        {pending.length > 0 && <>{pending.length} job{pending.length>1?'s':''} awaiting employee acceptance. </>}
        {stats?.total > 0 && <span className="text-green-600">{onTrack}% of all jobs on track.</span>}
        {!stats?.total && 'No jobs yet — create one to get started.'}
      </p>
    </div>
  );
}

function DashboardContent() {
  const dispatch = useDispatch();
  const { list: jobs, stats, loading } = useSelector(s => s.jobs);
  const { user } = useSelector(s => s.auth);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchStats());
    dispatch(fetchNotifs());
    dispatch(fetchUnread());
  }, [dispatch]);

  const topJobs = jobs
    .filter(j => !['COMPLETE'].includes(j.status))
    .sort((a,b) => {
      const order = { OVERDUE:0, AT_RISK:1, PENDING:2, ACTIVE:3, IN_REVIEW:4, PAUSED:5 };
      return (order[a.status]??9) - (order[b.status]??9);
    })
    .slice(0, 10);

  return (
    <div className="p-6">
      <AIInsight jobs={jobs} stats={stats} />

      {/* Stat cards */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <StatCard label="Total Jobs"  value={stats?.total     || 0} sub="All statuses"      dotColor="#6B7280" />
        <StatCard label="On Track"    value={stats?.active    || 0} sub="Within deadline"   dotColor="#16A34A" />
        <StatCard label="At Risk"     value={stats?.at_risk   || 0} sub="≤20% time left"    dotColor="#CA8A04" />
        <StatCard label="Overdue"     value={stats?.overdue   || 0} sub="Needs action now"  dotColor="#DC2626" />
        <StatCard label="Pending"     value={stats?.pending   || 0} sub="Awaiting accept"   dotColor="#2563EB" />
        <StatCard label="In Review"   value={stats?.in_review || 0} sub="QA / Approval"     dotColor="#7C3AED" />
      </div>

      {/* Jobs table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Priority Jobs</h2>
          <Button variant="ghost" size="sm" onClick={() => window.location.href='/jobs'}>View all →</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50/70">
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Job</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Client</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Assignee</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Progress</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Deadline</th>
              {user?.role === 'EMPLOYEE' && <th className="px-4 py-2.5 text-xs text-gray-400 font-medium">Action</th>}
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">Loading…</td></tr>}
              {!loading && !topJobs.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No active jobs</td></tr>}
              {topJobs.map(job => {
                const cfg = getStatusConfig(job.status);
                const days = getDaysLeft(job.due_date);
                return (
                  <tr key={job.id} onClick={() => setSelectedJob(job)} className="border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-400">{job.type?.replace(/_/g,' ')}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{job.client_name||'—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{background:job.assignee_color||'#4F46E5'}}>{job.assignee_initials}</div>
                        <span className="text-xs">{job.assignee_name?.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={job.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${job.progress}%`,background:cfg.color}} />
                        </div>
                        <span className="text-xs font-mono text-gray-500">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono font-semibold" style={{color:days<0?'#DC2626':days<=2?'#CA8A04':'#374151'}}>
                        {days<0?`${Math.abs(days)}d over`:days===0?'Due today':`${days}d left`}
                      </div>
                      <div className="text-[10px] text-gray-400">{fmtDate(job.due_date,{day:'numeric',month:'short'})}</div>
                    </td>
                    {user?.role === 'EMPLOYEE' && (
                      <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                        {job.status === 'PENDING' && job.assignee_id === user.id && (
                          <Button size="xs" onClick={()=>{dispatch(acceptJob(job.id));dispatch(showToast({message:'Job accepted!',type:'success'}))}}>Accept</Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick detail peek */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={e=>e.target===e.currentTarget&&setSelectedJob(null)}>
          <div className="bg-white w-80 h-full shadow-2xl border-l border-gray-100 overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div><div className="font-semibold text-sm">{selectedJob.title}</div><div className="text-xs text-gray-400">{selectedJob.client_name}</div></div>
              <button onClick={()=>setSelectedJob(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <StatusPill status={selectedJob.status} />
            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between"><span className="text-gray-400">Assignee</span><span className="font-medium">{selectedJob.assignee_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Progress</span><span className="font-mono font-medium">{selectedJob.progress}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Due</span><span className="font-medium">{fmtDate(selectedJob.due_date)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Scope</span><span className="font-medium">{selectedJob.scope_hours}h</span></div>
            </div>
            <Button className="mt-5 w-full justify-center" onClick={()=>{window.location.href=`/jobs`;setSelectedJob(null);}}>Open Full Detail →</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <><Topbar title="Dashboard" /><DashboardContent /></>;
}
