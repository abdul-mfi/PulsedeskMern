// app/daily-checkout/page.js
// EMPLOYEE: End-of-day closure form — updates daily_logs, updates task_logs with actual hours
'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import { showToast } from '../../store/slices/uiSlice';
import API from '../../lib/api';

const RATINGS = [
  { value:1, emoji:'⭐', label:'Poor' },
  { value:2, emoji:'⭐⭐', label:'Below average' },
  { value:3, emoji:'⭐⭐⭐', label:'Average' },
  { value:4, emoji:'⭐⭐⭐⭐', label:'Good' },
  { value:5, emoji:'⭐⭐⭐⭐⭐', label:'Excellent' },
];

function CheckoutContent() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [loading, setLoading]       = useState(false);
  const [fetchingLog, setFetching]  = useState(true);
  const [todayLog, setTodayLog]     = useState(null);
  const [taskLogs, setTaskLogs]     = useState([]);
  const [done, setDone]             = useState(false);

  const [form, setForm] = useState({
    accomplishments:   '',
    pending_work:      '',
    productive_hours:  '',
    day_rating:        4,
    challenges:        '',
    tomorrow_plan:     '',
    flag_to_manager:   '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setTask = (i, k, v) => setTaskLogs(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    API.get('/daily-logs', { params: { date: today } })
      .then(({ data }) => {
        const myLog = data.data?.find(l => l.user_id === user?.id);
        if (myLog) {
          setTodayLog(myLog);
          if (myLog.submission_status === 'COMPLETE') setDone(true);
          // Load today's task logs
          API.get(`/daily-logs/${myLog.id}/tasks`)
            .then(r => setTaskLogs(r.data.data || []))
            .catch(() => setTaskLogs([]));
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const submit = async () => {
    if (!form.accomplishments.trim()) {
      dispatch(showToast({ message: "Please add today's accomplishments", type: 'error' }));
      return;
    }
    setLoading(true);
    try {
      await API.post('/daily-logs/checkout', {
        ...form,
        productive_hours: parseFloat(form.productive_hours) || null,
        day_rating: parseInt(form.day_rating),
        task_logs: taskLogs.map(t => ({
          id:           t.id,
          actual_hours: parseFloat(t.actual_hours) || 0,
          completion:   parseInt(t.completion) || 0,
          status:       t.status || 'COMPLETE',
          notes:        t.notes || '',
        })),
      });
      dispatch(showToast({ message: '🌙 Day closure submitted. Great work today!', type: 'success' }));
      setDone(true);
    } catch (e) {
      const msg = e.response?.data?.message || 'Checkout failed';
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLog) return <div className="p-6 text-center text-gray-400 py-20">Loading today's log…</div>;

  if (!todayLog) return (
    <div className="p-6 max-w-lg mx-auto mt-12 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <div className="text-lg font-semibold text-gray-900 mb-2">No check-in found for today</div>
      <div className="text-sm text-gray-400 mb-6">You need to check in first before submitting day closure.</div>
      <Button onClick={() => window.location.href = '/daily-checkin'}>Go to Check-In →</Button>
    </div>
  );

  if (done) return (
    <div className="p-6 max-w-lg mx-auto mt-12 text-center">
      <div className="text-5xl mb-4">🌙</div>
      <div className="text-lg font-semibold text-gray-900 mb-2">Day closure submitted!</div>
      <div className="text-sm text-gray-400">Your manager can see your report. See you tomorrow.</div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header banner */}
      <div className="bg-indigo-900 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-sm">End of Day Closure</div>
          <div className="text-xs text-white/50">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div className="text-3xl">🌙</div>
      </div>

      {/* Task actuals */}
      {taskLogs.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="font-medium text-sm mb-1">Update Task Actuals</div>
          <div className="text-xs text-gray-400 mb-4">How much did you actually spend on each task? What % is complete?</div>
          <div className="flex flex-col gap-3">
            {taskLogs.map((t, i) => (
              <div key={t.id || i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="font-medium text-sm text-gray-800 mb-3">{t.task_name}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Actual Hours</label>
                    <input className="input" type="number" step="0.5" placeholder={t.planned_hours || '0'}
                      value={t.actual_hours || ''} onChange={e => setTask(i, 'actual_hours', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Completion %</label>
                    <input className="input" type="number" min="0" max="100" placeholder="100"
                      value={t.completion || ''} onChange={e => setTask(i, 'completion', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={t.status || 'COMPLETE'} onChange={e => setTask(i, 'status', e.target.value)}>
                      <option value="COMPLETE">Complete</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="CARRIED_FORWARD">Carried Forward</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="label">Notes</label>
                  <input className="input" placeholder="Any notes on this task…"
                    value={t.notes || ''} onChange={e => setTask(i, 'notes', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accomplishments */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-1">What did you accomplish today? *</div>
        <div className="text-xs text-gray-400 mb-3">Be specific — what got done, what was delivered, what moved forward?</div>
        <textarea className="input" rows={3}
          placeholder="e.g. Completed 3 logo concepts for Afia, submitted Google Ads report to Kiran, reviewed PK India copy…"
          value={form.accomplishments} onChange={e => set('accomplishments', e.target.value)} />
      </div>

      {/* Pending work */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-1">What's still pending or carried forward?</div>
        <textarea className="input" rows={2}
          placeholder="e.g. Waiting on Signature Global feedback, PK India brief 50% done…"
          value={form.pending_work} onChange={e => set('pending_work', e.target.value)} />
      </div>

      {/* Productive hours */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">How many productive hours did you log today?</div>
        <div className="flex items-center gap-3">
          <input className="input w-28" type="number" step="0.5" min="0" max="12" placeholder="7.5"
            value={form.productive_hours} onChange={e => set('productive_hours', e.target.value)} />
          <span className="text-sm text-gray-400">out of 8 hours</span>
          {form.productive_hours && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${parseFloat(form.productive_hours)>=7?'bg-green-50 text-green-700':parseFloat(form.productive_hours)>=5?'bg-yellow-50 text-yellow-700':'bg-red-50 text-red-700'}`}>
              {Math.round((parseFloat(form.productive_hours)/8)*100)}% efficiency
            </span>
          )}
        </div>
      </div>

      {/* Day rating */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-3">How would you rate today overall?</div>
        <div className="flex gap-3">
          {RATINGS.map(r => (
            <button key={r.value} onClick={() => set('day_rating', r.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all ${form.day_rating === r.value ? 'bg-brand/10 border-brand' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm">{r.emoji}</span>
              <span className="text-[9px] text-gray-500">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-1">Any challenges or learnings today?</div>
        <textarea className="input" rows={2}
          placeholder="e.g. Client feedback took longer than expected, learned a new animation technique…"
          value={form.challenges} onChange={e => set('challenges', e.target.value)} />
      </div>

      {/* Tomorrow plan */}
      <div className="card p-5 mb-4">
        <div className="font-medium text-sm mb-1">What's your top priority for tomorrow?</div>
        <textarea className="input" rows={2}
          placeholder="e.g. Finalize Afia brand deck, start Signature Global website wireframes…"
          value={form.tomorrow_plan} onChange={e => set('tomorrow_plan', e.target.value)} />
      </div>

      {/* Flag to manager */}
      <div className="card p-5 mb-6">
        <div className="font-medium text-sm mb-1">🚩 Flag to Manager (optional)</div>
        <div className="text-xs text-gray-400 mb-2">Anything your manager needs to know? Urgent concern, resource need, scope issue?</div>
        <textarea className="input" rows={2}
          placeholder="e.g. The Afia project scope has expanded significantly — need to discuss timeline…"
          value={form.flag_to_manager} onChange={e => set('flag_to_manager', e.target.value)} />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">Submitting at {new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</div>
        <Button onClick={submit} disabled={loading}>
          {loading ? 'Submitting…' : '🌙 Submit Day Closure'}
        </Button>
      </div>
    </div>
  );
}

export default function DailyCheckoutPage() {
  return <><Topbar title="Day Closure" /><CheckoutContent /></>;
}
