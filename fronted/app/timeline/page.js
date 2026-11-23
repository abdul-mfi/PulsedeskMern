'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import { fetchJobs } from '../../store/slices/jobsSlice';
import { getStatusConfig } from '../../utils/jobStatus';

function TimelineContent() {
  const dispatch = useDispatch();
  const { list: jobs, loading } = useSelector(s => s.jobs);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDays  = monthEnd.getDate();
  const todayPct   = ((now.getDate() - 1) / totalDays) * 100;

  // Days array for header
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getBarStyle = (job) => {
    const start = job.start_date ? new Date(job.start_date) : new Date(job.created_at);
    const due   = new Date(job.due_date);
    const startDay = Math.max(0, Math.floor((start - monthStart) / 86400000));
    const endDay   = Math.min(totalDays, Math.ceil((due - monthStart) / 86400000));
    const left  = (startDay / totalDays) * 100;
    const width = Math.max(2, ((endDay - startDay) / totalDays) * 100);
    return { left:`${left}%`, width:`${width}%` };
  };

  const activeJobs = jobs.filter(j => !['COMPLETE'].includes(j.status));

  return (
    <div className="p-6">
      <div className="card overflow-hidden">
        {/* Month header */}
        <div className="flex items-center px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <div className="w-48 shrink-0 text-xs font-semibold text-gray-500">TEAM MEMBER</div>
          <div className="flex-1 relative">
            <div className="flex">
              {days.map(d => (
                <div key={d} className="flex-1 text-center text-[9px] text-gray-300 font-mono">{d % 5 === 0 ? d : ''}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {loading && <div className="py-12 text-center text-sm text-gray-400">Loading timeline…</div>}
        {activeJobs.map(job => {
          const cfg = getStatusConfig(job.status);
          const bar = getBarStyle(job);
          return (
            <div key={job.id} className="flex items-center px-5 py-2.5 border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
              <div className="w-48 shrink-0">
                <div className="text-xs font-medium text-gray-800 truncate">{job.title}</div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: job.assignee_color }}>{job.assignee_initials}</div>
                  {job.assignee_name?.split(' ')[0]}
                </div>
              </div>
              <div className="flex-1 relative h-7">
                {/* Today line */}
                <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left:`${todayPct}%` }} />
                {/* Bar */}
                {bar.width !== '2%' && (
                  <div className="absolute top-1 h-5 rounded-md flex items-center px-2 overflow-hidden" style={{ ...bar, background:`${cfg.color}20`, border:`1px solid ${cfg.color}60` }}>
                    {/* Progress fill */}
                    <div className="absolute inset-0 rounded-md" style={{ width:`${job.progress}%`, background:`${cfg.color}30` }} />
                    <span className="relative text-[10px] font-semibold truncate" style={{ color: cfg.color }}>{job.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && !activeJobs.length && (
          <div className="py-12 text-center text-sm text-gray-400">No active jobs this month</div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-5 px-5 py-3 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-px bg-red-400"></div> Today</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-2 rounded-sm bg-green-200 border border-green-400"></div> On Track</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-2 rounded-sm bg-yellow-200 border border-yellow-400"></div> At Risk</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-2 rounded-sm bg-red-200 border border-red-400"></div> Overdue</div>
          <span className="ml-auto text-xs text-gray-400">{now.toLocaleString('default',{month:'long',year:'numeric'})}</span>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return <><Topbar title="Timeline / Gantt" /><TimelineContent /></>;
}
