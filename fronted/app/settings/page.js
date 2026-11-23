'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import { showToast } from '../../store/slices/uiSlice';
import API from '../../lib/api';

const BRAND_COLORS = ['#4F46E5','#7C3AED','#059669','#CA8A04','#DC2626','#0EA5E9','#0F1117','#BE123C','#D97706'];

function SettingsContent() {
  const dispatch = useDispatch();
  const { user: me } = useSelector(s => s.auth);
  const [settings, setSettings] = useState({ appName:'PulseDesk', brandColor:'#4F46E5', logoUrl:'' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    API.get('/workspace/settings').then(({ data }) => {
      setSettings(s => ({ ...s, ...(data.data||{}) }));
      setPreview(data.data?.logoUrl || '');
    });
  }, []);

  const save = async () => {
    setLoading(true);
    try { await API.patch('/workspace/settings', settings); dispatch(showToast({message:'Settings saved',type:'success'})); }
    catch { dispatch(showToast({message:'Failed to save',type:'error'})); }
    finally { setLoading(false); }
  };

  if (me?.role !== 'ADMIN') return (
    <div className="p-6"><div className="card p-8 text-center text-gray-400"><div className="text-2xl mb-2">🔒</div><div>Only Admins can access Settings</div></div></div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-sm mb-5 pb-3 border-b border-gray-100">Workspace Branding</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="label">App Name</label>
            <input className="input" value={settings.appName||''} onChange={e=>setSettings(s=>({...s,appName:e.target.value}))} />
          </div>
          <div>
            <label className="label">Brand Colour</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {BRAND_COLORS.map(c=>(
                  <button key={c} onClick={()=>setSettings(s=>({...s,brandColor:c}))} className={`w-8 h-8 rounded-lg border-2 transition-all ${settings.brandColor===c?'border-gray-900 scale-110':'border-white shadow-sm'}`} style={{background:c}} />
                ))}
              </div>
              <input type="color" value={settings.brandColor||'#4F46E5'} onChange={e=>setSettings(s=>({...s,brandColor:e.target.value}))} className="w-10 h-8 rounded cursor-pointer border border-gray-200" />
              <span className="text-xs font-mono text-gray-500">{settings.brandColor}</span>
            </div>
            <div className="mt-3 p-3 rounded-lg" style={{ background:`${settings.brandColor}15`, border:`1px solid ${settings.brandColor}30` }}>
              <span className="text-xs font-medium" style={{color:settings.brandColor}}>Preview: Sidebar + buttons will use this colour</span>
            </div>
          </div>
          <div>
            <label className="label">Logo URL (from Cloudinary)</label>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="https://res.cloudinary.com/…" value={settings.logoUrl||''} onChange={e=>{ setSettings(s=>({...s,logoUrl:e.target.value})); setPreview(e.target.value); }} />
              {preview && <img src={preview} alt="logo" className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-gray-50" />}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-sm mb-4 pb-3 border-b border-gray-100">Change Password</h2>
        <PasswordChange />
      </div>

      <Button onClick={save} disabled={loading}>{loading?'Saving…':'Save Settings'}</Button>
    </div>
  );
}

function PasswordChange() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    if (form.newPassword !== form.confirm) { dispatch(showToast({message:'Passwords do not match',type:'error'})); return; }
    if (form.newPassword.length < 6) { dispatch(showToast({message:'Min 6 characters',type:'error'})); return; }
    setLoading(true);
    try { await API.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword }); dispatch(showToast({message:'Password updated',type:'success'})); setForm({currentPassword:'',newPassword:'',confirm:''}); }
    catch (e) { dispatch(showToast({message:e.response?.data?.message||'Failed',type:'error'})); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-3">
      <div><label className="label">Current Password</label><input className="input" type="password" value={form.currentPassword} onChange={e=>set('currentPassword',e.target.value)} /></div>
      <div><label className="label">New Password</label><input className="input" type="password" value={form.newPassword} onChange={e=>set('newPassword',e.target.value)} /></div>
      <div><label className="label">Confirm New Password</label><input className="input" type="password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} /></div>
      <Button size="sm" variant="ghost" onClick={submit} disabled={loading}>{loading?'Updating…':'Update Password'}</Button>
    </div>
  );
}

export default function SettingsPage() {
  return <><Topbar title="Settings" /><SettingsContent /></>;
}
