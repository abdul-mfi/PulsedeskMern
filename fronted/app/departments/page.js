'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { showToast } from '../../store/slices/uiSlice';
import API from '../../lib/api';

const COLORS = ['#4F46E5','#7C3AED','#059669','#CA8A04','#DC2626','#0EA5E9','#D946EF','#16A34A','#BE123C'];

function DepartmentsContent() {
  const dispatch = useDispatch();
  const { user: me } = useSelector(s => s.auth);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', color:'#4F46E5' });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const load = async () => {
    setLoading(true);
    try { const { data } = await API.get('/departments'); setDepts(data.data || []); }
    catch { dispatch(showToast({message:'Failed to load departments',type:'error'})); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({name:'',description:'',color:'#4F46E5'}); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({name:d.name,description:d.description||'',color:d.color||'#4F46E5'}); setModalOpen(true); };

  const submit = async () => {
    if (!form.name.trim()) { dispatch(showToast({message:'Name required',type:'error'})); return; }
    try {
      if (editing) await API.patch(`/departments/${editing.id}`, form);
      else await API.post('/departments', form);
      dispatch(showToast({message:editing?'Updated':'Created',type:'success'}));
      setModalOpen(false); load();
    } catch { dispatch(showToast({message:'Failed',type:'error'})); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await API.delete(`/departments/${id}`); load(); dispatch(showToast({message:'Deleted',type:'success'})); }
    catch { dispatch(showToast({message:'Failed',type:'error'})); }
  };

  const canManage = ['ADMIN','MANAGER'].includes(me?.role);

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        {canManage && <Button onClick={openNew}>+ Add Department</Button>}
      </div>
      {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>}
      <div className="grid grid-cols-3 gap-4">
        {depts.map(d=>(
          <div key={d.id} className="card p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: d.color || '#4F46E5' }}>{d.name[0]}</div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{d.name}</div>
                {d.description && <div className="text-xs text-gray-400">{d.description}</div>}
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" className="flex-1 justify-center" onClick={()=>openEdit(d)}>Edit</Button>
                {me?.role==='ADMIN' && <Button size="xs" variant="danger" onClick={()=>remove(d.id)}>Delete</Button>}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Department':'Add Department'}
        footer={<><Button variant="ghost" onClick={()=>setModalOpen(false)}>Cancel</Button><Button onClick={submit}>{editing?'Update':'Create'}</Button></>}>
        <div className="flex flex-col gap-4">
          <div><label className="label">Name *</label><input className="input" placeholder="Technology" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
          <div><label className="label">Description</label><input className="input" placeholder="Optional description" value={form.description} onChange={e=>set('description',e.target.value)} /></div>
          <div><label className="label">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c=><button key={c} onClick={()=>set('color',c)} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color===c?'border-gray-900 scale-110':'border-white'}`} style={{background:c}} />)}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DepartmentsPage() {
  return <><Topbar title="Departments" /><DepartmentsContent /></>;
}
