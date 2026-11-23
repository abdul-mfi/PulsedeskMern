'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/usersSlice';
import { showToast } from '../../store/slices/uiSlice';
import API from '../../lib/api';

const ROLES = ['ADMIN','MANAGER','EMPLOYEE','HR'];
const COLORS = ['#4F46E5','#7C3AED','#059669','#CA8A04','#DC2626','#0EA5E9','#D946EF','#16A34A','#BE123C'];

function UserModal({ user, open, onClose }) {
  const dispatch = useDispatch();
  const isEdit = !!user?.id;
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'EMPLOYEE', designation:'', color:'#4F46E5', ...user });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    if (!form.name || !form.email) { dispatch(showToast({message:'Name and email required',type:'error'})); return; }
    setLoading(true);
    try {
      if (isEdit) await dispatch(updateUser({ id: user.id, ...form })).unwrap();
      else await dispatch(createUser(form)).unwrap();
      dispatch(showToast({message:isEdit?'Member updated':'Member added',type:'success'}));
      onClose();
    } catch (e) { dispatch(showToast({message:e||'Failed',type:'error'})); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit?'Edit Team Member':'Add Team Member'} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={loading}>{loading?'Saving…':isEdit?'Update':'Add Member'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="label">Full Name *</label><input className="input" placeholder="Raza Ahmed" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div><label className="label">Email *</label><input className="input" type="email" placeholder="raza@company.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
        <div><label className="label">Role</label>
          <select className="input" value={form.role} onChange={e=>set('role',e.target.value)}>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-span-2"><label className="label">Designation</label><input className="input" placeholder="Senior Developer" value={form.designation||''} onChange={e=>set('designation',e.target.value)} /></div>
        {!isEdit && <div className="col-span-2"><label className="label">Password (default: Welcome@123)</label><input className="input" type="password" placeholder="Leave blank for default" value={form.password||''} onChange={e=>set('password',e.target.value)} /></div>}
        <div className="col-span-2">
          <label className="label">Avatar Colour</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c=><button key={c} onClick={()=>set('color',c)} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color===c?'border-gray-900 scale-110':'border-white'}`} style={{background:c}} />)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TeamContent() {
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector(s => s.users);
  const { user: me } = useSelector(s => s.auth);
  const [modalUser, setModalUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const canManage = ['ADMIN','MANAGER'].includes(me?.role);
  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const openEdit = (u) => { setModalUser(u); setModalOpen(true); };
  const openNew  = ()  => { setModalUser(null); setModalOpen(true); };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this team member?')) return;
    await dispatch(deleteUser(id)).unwrap();
    dispatch(showToast({message:'Member deactivated',type:'success'}));
  };

  const ROLE_COLOR = { ADMIN:'bg-indigo-50 text-indigo-700', MANAGER:'bg-purple-50 text-purple-700', EMPLOYEE:'bg-green-50 text-green-700', HR:'bg-rose-50 text-rose-700' };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        {['all',...ROLES].map(r=>(
          <button key={r} onClick={()=>setFilter(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter===r?'bg-brand text-white border-brand':'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{r==='all'?`All (${users.length})`:r}</button>
        ))}
        <div className="ml-auto">
          {canManage && <Button onClick={openNew}>+ Add Member</Button>}
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading team…</div>}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(u=>(
          <div key={u.id} className="card p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <Avatar user={u} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{u.name}</div>
                <div className="text-xs text-gray-400 truncate">{u.designation}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${ROLE_COLOR[u.role]||'bg-gray-50 text-gray-500'}`}>{u.role}</span>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${u.is_active?'bg-green-500':'bg-gray-300'}`} title={u.is_active?'Active':'Inactive'}></span>
            </div>
            <div className="text-xs text-gray-400 truncate mb-4">{u.email}</div>
            {canManage && (
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" className="flex-1 justify-center" onClick={()=>openEdit(u)}>Edit</Button>
                {me?.role==='ADMIN' && u.id!==me?.id && (
                  <Button size="xs" variant="danger" onClick={()=>deactivate(u.id)}>Deactivate</Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)}>
        {modalOpen && <UserModal user={modalUser} open={modalOpen} onClose={()=>setModalOpen(false)} />}
      </Modal>
    </div>
  );
}

export default function TeamPage() {
  return <><Topbar title="Team Members" /><TeamContent /></>;
}
