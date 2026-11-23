'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import { fetchWorkload } from '../../store/slices/usersSlice';
import { fmtDate } from '../../utils/formatDate';
import { getStatusConfig } from '../../utils/jobStatus';

function CapacityBar({ pct }) {
  const color = pct >= 100 ? '#DC2626' : pct >= 75 ? '#CA8A04' : '#16A34A';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width:`${Math.min(pct,100)}%`, background:color }} />
      </div>
      <span className="text-xs font-mono font-semibold w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function WorkloadContent() {
  const dispatch = useDispatch();
  const { workload, loading } = useSelector(s => s.users);

  useEffect(() => { dispatch(fetchWorkload()); }, [dispatch]);

  return (
    <div className="p-6">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Team',   value: workload.length,                                   color:'#4F46E5' },
          { label:'At Capacity',  value: workload.filter(u=>u.capacity>=75).length,          color:'#CA8A04' },
          { label:'Overloaded',   value: workload.filter(u=>u.capacity>=100).length,         color:'#DC2626' },
          { label:'Available',    value: workload.filter(u=>u.capacity<50).length,           color:'#16A34A' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold font-mono" style={{ color:s.color }}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Member cards grid */}
      {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading workload data…</div>}
      <div className="grid grid-cols-2 gap-4">
        {workload.map(u => (
          <div key={u.id} className="card p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar user={u} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-400">{u.designation}</div>
                <div className="text-xs text-gray-400">{u.role}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-gray-900">{u.active_job_count}</div>
                <div className="text-[10px] text-gray-400">active jobs</div>
              </div>
            </div>

            {/* Capacity bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400">Capacity</span>
                <span className="text-[10px] font-medium text-gray-500">{u.capacity>=100?'⚠ Overloaded':u.capacity>=75?'Near full':'Available'}</span>
              </div>
              <CapacityBar pct={u.capacity || 0} />
            </div>

            {/* Active jobs list */}
            {u.jobs?.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Active Jobs</div>
                <div className="flex flex-col gap-1.5">
                  {u.jobs.slice(0,4).map(j => {
                    const cfg = getStatusConfig(j.status);
                    return (
                      <div key={j.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:cfg.color }}></span>
                        <span className="text-xs text-gray-700 flex-1 truncate">{j.title}</span>
                        <span className="text-[10px] font-mono text-gray-400">{j.progress}%</span>
                      </div>
                    );
                  })}
                  {u.jobs.length > 4 && <div className="text-[10px] text-gray-400 pl-2">+{u.jobs.length-4} more</div>}
                </div>
              </div>
            )}
            {!u.jobs?.length && <div className="text-xs text-gray-300 text-center py-2">No active jobs</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkloadPage() {
  return <><Topbar title="Team Workload" /><WorkloadContent /></>;
}
