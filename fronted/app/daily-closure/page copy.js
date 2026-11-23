'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import { fetchDaily } from '../../store/slices/reportsSlice';
import { showToast } from '../../store/slices/uiSlice';
import { fmtDate } from '../../utils/formatDate';
import API from '../../lib/api';

function FlagModal({ person, open, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ reason:'', severity:'ADVISORY', details:'', recommended_action:'' });
  const set = (k, v) => setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    if (!form.reason.trim()) { dispatch(showToast({ message:'Reason required', type:'error' })); return; }
    try {
      await API.post('/hr/flags', { flagged_person_id: person.id, ...form });
      dispatch(showToast({ message:`${person.name} flagged`, type:'success' }));
      onClose();
    } catch { dispatch(showToast({ message:'Failed to create flag', type:'error' })); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Flag ${person?.name}`} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={submit}>Raise Flag</Button></>}>
      <div className="flex flex-col gap-4">
        <div><label className="label">Reason *</label><input className="input" placeholder="e.g. Missed daily submission 3 days in a row" value={form.reason} onChange={e=>set('reason',e.target.value)} /></div>
        <div><label className="label">Severity</label>
          <select className="input" value={form.severity} onChange={e=>set('severity',e.target.value)}>
            <option value="ADVISORY">Advisory — informal note</option>
            <option value="WARNING">Warning — formal notice</option>
            <option value="SERIOUS">Serious — escalation required</option>
          </select>
        </div>
        <div><label className="label">Details</label><textarea className="input" rows={2} placeholder="Additional context…" value={form.details} onChange={e=>set('details',e.target.value)} /></div>
        <div><label className="label">Recommended Action</label><input className="input" placeholder="e.g. One-on-one with manager" value={form.recommended_action} onChange={e=>set('recommended_action',e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function DailyClosureContent() {
  const dispatch = useDispatch();
  const { daily, loading } = useSelector(s => s.reports);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [flagPerson, setFlagPerson] = useState(null);

  useEffect(() => { dispatch(fetchDaily({ date })); }, [dispatch, date]);

  const STATUS_STYLE = {
    COMPLETE: { bg:'bg-green-50 border-green-200', dot:'bg-green-500', label:'Submitted' },
    PARTIAL:  { bg:'bg-yellow-50 border-yellow-200', dot:'bg-yellow-500', label:'Partial' },
    MISSED:   { bg:'bg-red-50 border-red-200', dot:'bg-red-500', label:'Not submitted' },
  };

  const d = daily;

  return (
    <div className="p-6">
      {/* Date selector + summary */}
      <div className="flex items-center gap-4 mb-6">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input w-44" />
        {d && (
          <div className="flex gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center"><div className="text-lg font-bold font-mono text-green-600">{d.summary?.submitted||0}</div><div className="text-[10px] text-green-600">Submitted</div></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-center"><div className="text-lg font-bold font-mono text-yellow-600">{d.summary?.partial||0}</div><div className="text-[10px] text-yellow-600">Partial</div></div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center"><div className="text-lg font-bold font-mono text-red-600">{d.summary?.missed||0}</div><div className="text-[10px] text-red-600">Missed</div></div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center"><div className="text-lg font-bold font-mono text-gray-600">{d.summary?.avg_efficiency||0}%</div><div className="text-[10px] text-gray-500">Avg efficiency</div></div>
          </div>
        )}
      </div>

      {/* Alert: people who didn't submit */}
      {d?.members?.filter(m=>m.status==='MISSED').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-red-700">⚠ {d.members.filter(m=>m.status==='MISSED').length} team members did not submit today</div>
            <div className="text-xs text-red-500 mt-0.5">{d.members.filter(m=>m.status==='MISSED').map(m=>m.user.name).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Member cards */}
      {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading report…</div>}
      <div className="grid grid-cols-2 gap-4">
        {d?.members?.map(m => {
          const style = STATUS_STYLE[m.status] || STATUS_STYLE.MISSED;
          return (
            <div key={m.user.id} className={`card border p-4 ${style.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Avatar user={m.user} size="md" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{m.user.name}</div>
                    <div className="text-xs text-gray-400">{m.user.designation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                  <span className="text-xs font-medium text-gray-600">{style.label}</span>
                </div>
              </div>

              {m.log && (
                <div className="grid grid-cols-3 gap-2 text-center mt-2 mb-3">
                  <div className="bg-white/70 rounded-lg py-1.5"><div className="text-sm font-bold font-mono text-gray-800">{m.hours_logged || 0}h</div><div className="text-[9px] text-gray-400">Hours</div></div>
                  <div className="bg-white/70 rounded-lg py-1.5"><div className="text-sm font-bold font-mono text-gray-800">{m.task_count || 0}</div><div className="text-[9px] text-gray-400">Tasks</div></div>
                  <div className="bg-white/70 rounded-lg py-1.5"><div className="text-sm font-bold font-mono text-gray-800">{m.efficiency || 0}%</div><div className="text-[9px] text-gray-400">Efficiency</div></div>
                </div>
              )}

              {m.log?.top_goals && <div className="text-xs text-gray-600 mb-1"><span className="font-medium text-gray-500">Goals: </span>{m.log.top_goals}</div>}
              {m.log?.blockers   && <div className="text-xs text-red-600 mb-1"><span className="font-medium">Blocker: </span>{m.log.blockers}</div>}

              {m.status === 'MISSED' && (
                <Button size="xs" variant="danger" className="mt-3 w-full justify-center" onClick={() => setFlagPerson(m.user)}>
                  🚩 Flag to HR
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {flagPerson && <FlagModal person={flagPerson} open={!!flagPerson} onClose={() => setFlagPerson(null)} />}
    </div>
  );
}

export default function DailyClosurePage() {
  return <><Topbar title="Daily Closure Report" /><DailyClosureContent /></>;
}
