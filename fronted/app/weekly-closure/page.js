'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Avatar from '../../components/ui/Avatar';
import { fetchWeekly } from '../../store/slices/reportsSlice';
import { showToast } from '../../store/slices/uiSlice';
import API from '../../lib/api';

const DOT = {
  COMPLETE: { bg:'#16A34A', label:'✓', title:'Submitted' },
  PARTIAL:  { bg:'#CA8A04', label:'~', title:'Partial' },
  MISSED:   { bg:'#DC2626', label:'✕', title:'Missed' },
  FUTURE:   { bg:'#E4E7EF', label:'·', title:'Upcoming' },
};

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];

function WeeklyClosureContent() {
  const dispatch = useDispatch();
  const { weekly, loading } = useSelector(s => s.reports);

  const getMondayOfWeek = (offset=0) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day===0?-6:1) + offset*7;
    d.setDate(diff); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  };

  const [weekStart, setWeekStart] = useState(getMondayOfWeek(0));
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => { dispatch(fetchWeekly({ week_start: weekStart })); }, [dispatch, weekStart]);

  const changeWeek = (dir) => {
    const newOffset = weekOffset + dir;
    setWeekOffset(newOffset);
    setWeekStart(getMondayOfWeek(newOffset));
  };

  const w = weekly;

  return (
    <div className="p-6">
      {/* Week nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={()=>changeWeek(-1)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">‹</button>
        <span className="text-sm font-semibold">
          Week of {weekStart ? new Date(weekStart).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : ''}
        </span>
        <button onClick={()=>changeWeek(1)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">›</button>
        <button onClick={()=>{setWeekOffset(0);setWeekStart(getMondayOfWeek(0));}} className="text-xs text-brand hover:underline ml-2">This week</button>

        {w && (
          <div className="ml-auto flex gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-center"><span className="text-sm font-bold font-mono text-green-600">{w.summary?.full_week||0}</span><span className="text-[10px] text-green-600 ml-1">Full week</span></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-center"><span className="text-sm font-bold font-mono text-yellow-600">{w.summary?.partial_week||0}</span><span className="text-[10px] text-yellow-600 ml-1">Partial</span></div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-center"><span className="text-sm font-bold font-mono text-red-600">{w.summary?.at_risk||0}</span><span className="text-[10px] text-red-600 ml-1">At risk</span></div>
          </div>
        )}
      </div>

      {/* Heatmap table */}
      <div className="card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium w-52">Team Member</th>
              {DAYS.map(d => <th key={d} className="px-3 py-3 text-xs text-gray-400 font-medium text-center w-20">{d}</th>)}
              <th className="px-4 py-3 text-xs text-gray-400 font-medium text-center">Hours</th>
              <th className="px-4 py-3 text-xs text-gray-400 font-medium text-center">Attendance</th>
              <th className="px-4 py-3 text-xs text-gray-400 font-medium text-center">Status</th>
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="py-8 text-center text-sm text-gray-400">Loading weekly data…</td></tr>}
              {!loading && !w?.members?.length && <tr><td colSpan={9} className="py-8 text-center text-sm text-gray-400">No data for this week</td></tr>}
              {w?.members?.map(m => {
                const STATUS_BG = { FULL:'bg-green-50', PARTIAL:'bg-yellow-50', AT_RISK:'bg-red-50' };
                const STATUS_TEXT = { FULL:'text-green-700', PARTIAL:'text-yellow-700', AT_RISK:'text-red-700' };
                const STATUS_LABEL = { FULL:'Full week', PARTIAL:'Partial', AT_RISK:'⚠ At risk' };
                return (
                  <tr key={m.user.id} className="border-t border-gray-50 hover:bg-gray-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar user={m.user} size="sm" />
                        <div>
                          <div className="text-xs font-medium text-gray-900">{m.user.name}</div>
                          <div className="text-[10px] text-gray-400">{m.user.designation}</div>
                        </div>
                      </div>
                    </td>
                    {m.days?.map((day, i) => {
                      const dot = DOT[day.status] || DOT.FUTURE;
                      return (
                        <td key={i} className="px-3 py-3 text-center">
                          <div title={dot.title} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto cursor-default" style={{ background: dot.bg }}>
                            {dot.label}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-xs font-mono font-semibold text-gray-700">{m.total_hours}h</td>
                    <td className="px-4 py-3 text-center text-xs font-mono font-semibold text-gray-700">{m.attendance_rate}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BG[m.week_status]||'bg-gray-50'} ${STATUS_TEXT[m.week_status]||'text-gray-500'}`}>
                        {STATUS_LABEL[m.week_status] || m.week_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dot legend */}
      <div className="flex items-center gap-5">
        {Object.entries(DOT).filter(([k])=>k!=='FUTURE').map(([k,v]) => (
          <div key={k} className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background:v.bg }}>{v.label}</div>
            {v.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyClosurePage() {
  return <><Topbar title="Weekly Closure" /><WeeklyClosureContent /></>;
}
