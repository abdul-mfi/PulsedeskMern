'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import RingProgress from '../../components/ui/RingProgress';
import { fetchMonthly } from '../../store/slices/reportsSlice';
import { showToast } from '../../store/slices/uiSlice';
import { TIER_CONFIG } from '../../utils/jobStatus';
import { getCurrentMonth } from '../../utils/formatDate';
import API from '../../lib/api';

const AWARD_CATS = ['STAR_PERFORMER','MOST_CONSISTENT','MOST_IMPROVED','BEST_CLIENT_DELIVERY','TEAM_PLAYER','ABOVE_AND_BEYOND'];
const RANKS = ['🥇','🥈','🥉'];

function NominateModal({ person, users, open, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ nominated_id: person?.id||'', category:'STAR_PERFORMER', reason:'' });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    if (!form.reason.trim()) { dispatch(showToast({message:'Reason required',type:'error'})); return; }
    try {
      await API.post('/hr/awards/nominate', form);
      dispatch(showToast({message:'Nomination submitted!',type:'success'}));
      onClose();
    } catch { dispatch(showToast({message:'Failed',type:'error'})); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nominate for Award" size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gold" onClick={submit}>Submit Nomination</Button></>}>
      <div className="flex flex-col gap-4">
        <div><label className="label">Nominate</label>
          <select className="input" value={form.nominated_id} onChange={e=>set('nominated_id',e.target.value)}>
            <option value="">Select employee</option>
            {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div><label className="label">Award Category</label>
          <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
            {AWARD_CATS.map(c=><option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <div><label className="label">Reason *</label>
          <textarea className="input" rows={3} placeholder="Why does this person deserve this award?" value={form.reason} onChange={e=>set('reason',e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function PerformanceCard({ member, rank, onFlag, onNominate }) {
  const tc = TIER_CONFIG[member.tier] || TIER_CONFIG.STRONG;
  const tierColor = { STAR:'#D97706', STRONG:'#16A34A', RISK:'#F97316', FLAG:'#BE123C' };
  const color = tierColor[member.tier] || '#16A34A';

  return (
    <div className={`card border-2 p-5 relative ${tc.border} ${tc.bg}`}>
      {rank !== undefined && <span className="absolute top-3 right-4 text-2xl">{RANKS[rank] || ''}</span>}
      {member.hr_flagged && <span className="absolute top-3 left-3 text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-semibold">HR FLAG</span>}

      {/* Person */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <Avatar user={member.user} size="lg" />
        <div>
          <div className="font-semibold text-sm text-gray-900">{member.user.name}</div>
          <div className="text-xs text-gray-400">{member.user.designation}</div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border} mt-1 inline-block`}>{tc.label}</span>
        </div>
      </div>

      {/* Score ring + metrics */}
      <div className="flex items-center gap-4 mb-4">
        <RingProgress percent={member.score} color={color} size={64} strokeWidth={5} label={`${member.score}`} />
        <div className="flex-1 grid grid-cols-3 gap-2">
          {[
            { label:'Completion', val:`${member.completion}%` },
            { label:'Attendance', val:`${member.attendance}%` },
            { label:'On-Time',    val:`${member.ontime}%` },
          ].map(m=>(
            <div key={m.label} className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-sm font-bold font-mono text-gray-800">{m.val}</div>
              <div className="text-[9px] text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bars */}
      {[
        { label:'Completion', val:member.completion, color:'#4F46E5' },
        { label:'Attendance', val:member.attendance, color:'#16A34A' },
        { label:'On-Time Delivery', val:member.ontime, color:'#CA8A04' },
      ].map(b=>(
        <div key={b.label} className="mb-1.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-0.5"><span>{b.label}</span><span className="font-mono">{b.val}%</span></div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${b.val}%`,background:b.color}} /></div>
        </div>
      ))}

      {/* Award badges */}
      {member.awards?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {member.awards.map((a,i)=><span key={i} className="text-[9.5px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">🏆 {a.category?.replace(/_/g,' ')}</span>)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Button size="xs" variant="gold" className="flex-1 justify-center" onClick={()=>onNominate(member.user)}>🏆 Nominate</Button>
        {!member.hr_flagged && <Button size="xs" variant="danger" className="flex-1 justify-center" onClick={()=>onFlag(member.user)}>🚩 Flag</Button>}
      </div>
    </div>
  );
}

function MonthlyPerformanceContent() {
  const dispatch = useDispatch();
  const { monthly, loading } = useSelector(s => s.reports);
  const { list: users } = useSelector(s => s.users);
  const { user: me } = useSelector(s => s.auth);
  const [month, setMonth] = useState(getCurrentMonth());
  const [flagPerson, setFlagPerson] = useState(null);
  const [nominatePerson, setNominatePerson] = useState(null);

  useEffect(() => { dispatch(fetchMonthly({ month })); }, [dispatch, month]);

  const m = monthly;
  const canManage = ['ADMIN','MANAGER','HR'].includes(me?.role);

  return (
    <div className="p-6">
      {/* Month selector + summary */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="input w-44" />
        {m && (
          <div className="flex gap-3">
            {[
              {label:'⭐ Star', val:m.summary?.star||0, color:'#D97706', bg:'bg-amber-50', border:'border-amber-200'},
              {label:'✓ Strong', val:m.summary?.strong||0, color:'#16A34A', bg:'bg-green-50', border:'border-green-200'},
              {label:'⚠ At Risk', val:m.summary?.risk||0, color:'#F97316', bg:'bg-orange-50', border:'border-orange-200'},
              {label:'🚩 Flagged', val:m.summary?.flagged||0, color:'#BE123C', bg:'bg-rose-50', border:'border-rose-200'},
              {label:'Avg Score', val:`${m.summary?.avg_score||0}`, color:'#4F46E5', bg:'bg-indigo-50', border:'border-indigo-200'},
            ].map(s=>(
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-4 py-2 text-center`}>
                <div className="text-xl font-bold font-mono" style={{color:s.color}}>{s.val}</div>
                <div className="text-[10px] mt-0.5" style={{color:s.color}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Award nominations section */}
      {m?.leaderboard?.some(l=>l.awards?.length) && (
        <div className="card p-5 mb-6">
          <div className="text-sm font-semibold mb-4">🏆 Award Nominations — {month}</div>
          <div className="grid grid-cols-3 gap-4">
            {m.leaderboard.filter(l=>l.awards?.length>0).slice(0,3).map(l=>(
              <div key={l.user.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <Avatar user={l.user} size="xl" className="mx-auto mb-2" />
                <div className="font-semibold text-sm">{l.user.name}</div>
                <div className="text-xs text-gray-400 mb-2">{l.user.designation}</div>
                {l.awards.map((a,i)=><div key={i} className="text-[10px] text-amber-700 font-medium">{a.category?.replace(/_/g,' ')}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="font-semibold text-sm">Performance Leaderboard</div>
          {canManage && <Button size="sm" variant="gold" onClick={()=>setNominatePerson({id:''})}>🏆 Nominate</Button>}
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-50/70">
            <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium w-8">#</th>
            <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Member</th>
            <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-center">Score</th>
            <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-center">Completion</th>
            <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-center">Attendance</th>
            <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-center">On-Time</th>
            <th className="px-4 py-2.5 text-xs text-gray-400 font-medium text-center">Tier</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">Loading performance data…</td></tr>}
            {m?.leaderboard?.map((member, i) => {
              const tc = TIER_CONFIG[member.tier] || TIER_CONFIG.STRONG;
              const tierColor = { STAR:'#D97706', STRONG:'#16A34A', RISK:'#F97316', FLAG:'#BE123C' };
              return (
                <tr key={member.user.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-mono">{RANKS[i]||`${i+1}`}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar user={member.user} size="sm" />
                      <div><div className="text-xs font-medium text-gray-900">{member.user.name}</div><div className="text-[10px] text-gray-400">{member.user.designation}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RingProgress percent={member.score} color={tierColor[member.tier]||'#16A34A'} size={36} strokeWidth={3} label={`${member.score}`} />
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono font-semibold text-gray-700">{member.completion}%</td>
                  <td className="px-4 py-3 text-center text-xs font-mono font-semibold text-gray-700">{member.attendance}%</td>
                  <td className="px-4 py-3 text-center text-xs font-mono font-semibold text-gray-700">{member.ontime}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border}`}>{tc.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Performance cards grid */}
      {loading && <div className="text-center py-8 text-gray-400 text-sm">Loading cards…</div>}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {m?.leaderboard?.map((member, i) => (
          <PerformanceCard key={member.user.id} member={member} rank={i < 3 ? i : undefined}
            onFlag={setFlagPerson} onNominate={setNominatePerson} />
        ))}
      </div>

      {/* Active HR Flags */}
      {canManage && m?.hr_flags?.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold text-sm mb-4 text-rose-700">🚩 Active HR Flags — {month}</div>
          <div className="flex flex-col gap-3">
            {m.hr_flags.map(f=>(
              <div key={f.id} className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
                <Avatar user={{name:f.person_name,initials:f.person_initials,color:f.person_color,photo_url:f.person_photo}} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">{f.person_name}</span>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${f.severity==='SERIOUS'?'bg-red-600 text-white':f.severity==='WARNING'?'bg-orange-500 text-white':'bg-amber-100 text-amber-700'}`}>{f.severity}</span>
                  </div>
                  <div className="text-xs text-gray-600">{f.reason}</div>
                  {f.details && <div className="text-xs text-gray-400 mt-0.5">{f.details}</div>}
                  <div className="text-[10px] text-gray-400 mt-1">Raised by {f.flagged_by_name}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="ghost" onClick={async()=>{await API.patch(`/hr/flags/${f.id}`,{status:'RESOLVED'});dispatch(fetchMonthly({month}));}}>Resolve</Button>
                  <Button size="xs" variant="danger" onClick={async()=>{await API.patch(`/hr/flags/${f.id}`,{status:'ESCALATED'});dispatch(fetchMonthly({month}));}}>Escalate</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {flagPerson && (
        <Modal open={!!flagPerson} onClose={()=>setFlagPerson(null)} title={`Flag ${flagPerson?.name||'Employee'}`} size="md"
          footer={<><Button variant="ghost" onClick={()=>setFlagPerson(null)}>Cancel</Button><Button variant="danger" onClick={async()=>{await API.post('/hr/flags',{flagged_person_id:flagPerson.id,reason:'Performance issue',severity:'ADVISORY'});setFlagPerson(null);dispatch(showToast({message:'Flagged',type:'success'}));}}>Submit Flag</Button></>}>
          <p className="text-sm text-gray-500">Use the full Daily Closure report for detailed flag options.</p>
        </Modal>
      )}
      {nominatePerson && <NominateModal person={nominatePerson} users={m?.leaderboard?.map(l=>l.user)||[]} open={!!nominatePerson} onClose={()=>setNominatePerson(null)} />}
    </div>
  );
}

export default function MonthlyPerformancePage() {
  return <><Topbar title="Monthly Performance" /><MonthlyPerformanceContent /></>;
}
