// app/daily-checkin/page.js
// EMPLOYEE: Morning check-in form — feeds daily_logs + task_logs tables
'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import { showToast } from '../../store/slices/uiSlice';
import { fetchClients } from '../../store/slices/clientsSlice';
import API from '../../lib/api';

const WORK_MODES = [
  { value:'IN_OFFICE',     label:'🏢 In Office' },
  { value:'WORK_FROM_HOME',label:'🏠 Work from Home' },
  { value:'CLIENT_SITE',   label:'🤝 Client Site' },
  { value:'FIELD',          label:'🚗 Field' },
];

const MOODS = [
  { value:1, emoji:'😩', label:'Exhausted' },
  { value:2, emoji:'😕', label:'Low' },
  { value:3, emoji:'😐', label:'Neutral' },
  { value:4, emoji:'🙂', label:'Good' },
  { value:5, emoji:'🤩', label:'Energised' },
];

const PRIORITIES = ['HIGH','MEDIUM','LOW'];

const emptyTask = () => ({ task_name:'', planned_hours:'', priority:'MEDIUM', client_name:'', notes:'' });

function CheckinContent() {
  const dispatch  = useDispatch();
  const { user }  = useSelector(s => s.auth);
  const { list: clients } = useSelector(s => s.clients);

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    work_mode:       'IN_OFFICE',
    day_type:        '',
    clients:         [],
    priority_client: '',
    top_goals:       '',
    blockers:        '',
    mood_score:      3,
  });
  const [taskLogs, setTaskLogs] = useState([emptyTask()]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Check if already checked in today
  useEffect(() => {
    dispatch(fetchClients());
    API.get('/daily-logs', { params: { date: new Date().toISOString().slice(0,10) } })
      .then(({ data }) => {
        const myLog = data.data?.find(l => l.user_id === user?.id);
        if (myLog) setAlreadySubmitted(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [dispatch, user]);

  const addTask   = () => setTaskLogs(p => [...p, emptyTask()]);
  const removeTask = (i) => setTaskLogs(p => p.filter((_,idx) => idx !== i));
  const setTask   = (i, k, v) => setTaskLogs(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  const toggleClient = (name) => {
    setForm(p => ({
      ...p,
      clients: p.clients.includes(name) ? p.clients.filter(c => c !== name) : [...p.clients, name],
    }));
  };

  const submit = async () => {
    if (!form.top_goals.trim()) {
      dispatch(showToast({ message: 'Please add your top goals for today', type: 'error' }));
      return;
    }
    if (taskLogs.some(t => !t.task_name.trim())) {
      dispatch(showToast({ message: 'All tasks need a name', type: 'error' }));
      return;
    }
    setLoading(true);
    try {
      await API.post('/daily-logs/checkin', {
        ...form,
        task_logs: taskLogs.filter(t => t.task_name.trim()),
      });
      dispatch(showToast({ message: '✅ Checked in! Have a productive day.', type: 'success' }));
      setAlreadySubmitted(true);
    } catch (e) {
      const msg = e.response?.data?.message || 'Check-in failed';
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="p-6 text-center text-gray-400 text-sm py-20">Checking today's status…</div>;

  if (alreadySubmitted) return (
    <div className="p-6 max-w-lg mx-auto mt-12 text-center">
      <div className="text-5xl mb-4">✅</div>
      <div className="text-lg font-semibold text-gray-900 mb-2">You've checked in today!</div>
      <div className="text-sm text-gray-400 mb-6">Come back at end of day to submit your day closure.</div>
      <Button onClick={() => window.location.href = '/daily-checkout'}>Submit Day Closure →</Button>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Date banner */}
      <div className="bg-brand-light border border-brand/20 rounded-xl px-5 py-3 mb-6 flex items-center justify-between">
        <div>
          <div className="font-semibold text-brand text-sm">Morning Check-In</div>
          <div className="text-xs text-brand/60">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>
        <div className="text-3xl">☀️</div>
      </div>

      {/* Work mode */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">Where are you working from today?</div>
        <div className="grid grid-cols-2 gap-2">
          {WORK_MODES.map(m => (
            <button key={m.value} onClick={() => set('work_mode', m.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.work_mode === m.value ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/30'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">How are you feeling today?</div>
        <div className="flex gap-3">
          {MOODS.map(m => (
            <button key={m.value} onClick={() => set('mood_score', m.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${form.mood_score === m.value ? 'bg-brand/10 border-brand' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients working with today */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">Which clients are you working with today?</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {clients.map(c => (
            <button key={c.id} onClick={() => toggleClient(c.name)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.clients.includes(c.name) ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/30'}`}>
              {c.name}
            </button>
          ))}
        </div>
        {form.clients.length > 0 && (
          <div className="mt-3">
            <label className="label">Priority Client Today</label>
            <select className="input" value={form.priority_client} onChange={e => set('priority_client', e.target.value)}>
              <option value="">Select priority client</option>
              {form.clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Top goals */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">What are your top goals for today? *</div>
        <textarea className="input" rows={3}
          placeholder="e.g. Complete brand brief for Afia, Review Signature Global copy, Update myJmart progress…"
          value={form.top_goals} onChange={e => set('top_goals', e.target.value)} />
      </div>

      {/* Blockers */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-1">Any blockers or dependencies?</div>
        <div className="text-xs text-gray-400 mb-3">Awaiting feedback, missing assets, unclear brief, stuck on something?</div>
        <textarea className="input" rows={2}
          placeholder="e.g. Waiting for Afia's content brief to proceed with design…"
          value={form.blockers} onChange={e => set('blockers', e.target.value)} />
      </div>

      {/* Task plan */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium text-sm">Today's Task Plan</div>
            <div className="text-xs text-gray-400 mt-0.5">What tasks are you planning to work on? Add estimated hours.</div>
          </div>
          <Button size="sm" variant="ghost" onClick={addTask}>+ Add Task</Button>
        </div>

        <div className="flex flex-col gap-3">
          {taskLogs.map((task, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <div className="flex-1">
                  <label className="label">Task Name *</label>
                  <input className="input" placeholder="e.g. Design logo concepts for Afia"
                    value={task.task_name} onChange={e => setTask(i, 'task_name', e.target.value)} />
                </div>
                {taskLogs.length > 1 && (
                  <button onClick={() => removeTask(i)} className="mt-5 text-gray-300 hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center transition-colors">×</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Est. Hours</label>
                  <input className="input" type="number" step="0.5" placeholder="2.5"
                    value={task.planned_hours} onChange={e => setTask(i, 'planned_hours', e.target.value)} />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={task.priority} onChange={e => setTask(i, 'priority', e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Client</label>
                  <input className="input" placeholder="Client name"
                    value={task.client_name} onChange={e => setTask(i, 'client_name', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">Submitting at {new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</div>
        <Button onClick={submit} disabled={loading}>
          {loading ? 'Checking in…' : '✅ Submit Check-In'}
        </Button>
      </div>
    </div>
  );
}

export default function DailyCheckinPage() {
  return <><Topbar title="Daily Check-In" /><CheckinContent /></>;
}
