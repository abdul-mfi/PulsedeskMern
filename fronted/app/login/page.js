'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { loginThunk } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';

const DEMO = [
  { name:'Mir Shahnawaz', email:'admin@mindframeindia.com',  role:'Admin' },
  { name:'Zara Hussain',  email:'zara@mindframeindia.com',   role:'Manager' },
  { name:'Raza Ahmed',    email:'raza@mindframeindia.com',   role:'Employee' },
  { name:'HR Manager',    email:'hr@mindframeindia.com',     role:'HR' },
];

function LoginForm() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { loading, error } = useSelector(s => s.auth);
  // const [form, setForm] = useState({ email:'admin@mindframeindia.com', password:'Welcome@123' });
  const [form, setForm] = useState({ email:'', password:'' });

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(res)) router.push('/dashboard');
  };

  return (
    <div className="login-form min-h-screen flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0F1117 0%,#1a1d2e 50%,#0F1117 100%)' }}>
      <div className="w-96 bg-white/[.04] border border-white/[.08] rounded-2xl p-9 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
          </div>
          <div>
            <div className="text-xl font-bold text-white">PulseDesk</div>
            <div className="text-[10px] text-white/35 tracking-widest">DEADLINE INTELLIGENCE CRM</div>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-xl mb-5">{error}</div>}

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-xs text-white/50 font-medium mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required className="w-full px-4 py-2.5 bg-white/[.06] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand" />
          </div>
          <div className="mb-6">
            <label className="block text-xs text-white/50 font-medium mb-1.5 uppercase tracking-wide">Password</label>
            <input type="text" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required className="w-full px-4 py-2.5 bg-white/[.06] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in to PulseDesk'}
          </button>
        </form>

        <div className="text-center text-white/20 text-xs my-5">— or sign in as a demo user —</div>
        <div className="grid grid-cols-2 gap-2">
          {/* {DEMO.map(u => (
            <button key={u.email} onClick={() => setForm({ email:u.email, password:'Welcome@123' })} className="px-3 py-2.5 bg-white/[.04] border border-white/[.08] hover:bg-white/[.08] hover:border-brand/50 rounded-xl text-left transition-all">
              <div className="text-xs font-medium text-white">{u.name.split(' ')[0]}</div>
              <div className="text-[10px] text-white/35">{u.role}</div>
            </button>
          ))} */}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Provider store={store}><LoginForm /></Provider>;
}
