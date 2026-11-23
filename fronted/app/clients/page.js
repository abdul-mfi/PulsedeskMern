'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../../components/layout/AppShell';
import Topbar from '../../components/layout/Topbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { fetchClients, createClient, updateClient, deleteClient } from '../../store/slices/clientsSlice';
import { showToast } from '../../store/slices/uiSlice';

function ClientModal({ client, open, onClose }) {
  const dispatch = useDispatch();
  const isEdit = !!client?.id;
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'', ...client });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async () => {
    if (!form.name.trim()) { dispatch(showToast({message:'Client name required',type:'error'})); return; }
    setLoading(true);
    try {
      if (isEdit) await dispatch(updateClient({ id: client.id, ...form })).unwrap();
      else await dispatch(createClient(form)).unwrap();
      dispatch(showToast({message:isEdit?'Client updated':'Client added',type:'success'}));
      onClose();
    } catch (e) { dispatch(showToast({message:'Failed',type:'error'})); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit?'Edit Client':'Add Client'} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={loading}>{loading?'Saving…':isEdit?'Update':'Add Client'}</Button></>}>
      <div className="flex flex-col gap-4">
        <div><label className="label">Client Name *</label><input className="input" placeholder="Afia Younus" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" type="email" placeholder="contact@client.com" value={form.email||''} onChange={e=>set('email',e.target.value)} /></div>
        <div><label className="label">Phone</label><input className="input" placeholder="+91 99999 00000" value={form.phone||''} onChange={e=>set('phone',e.target.value)} /></div>
        <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Any notes about this client…" value={form.notes||''} onChange={e=>set('notes',e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function ClientsContent() {
  const dispatch = useDispatch();
  const { list: clients, loading } = useSelector(s => s.clients);
  const { user: me } = useSelector(s => s.auth);
  const [modalClient, setModalClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { dispatch(fetchClients()); }, [dispatch]);

  const canManage = ['ADMIN','MANAGER'].includes(me?.role);
  const openEdit = (c) => { setModalClient(c); setModalOpen(true); };
  const openNew  = ()  => { setModalClient(null); setModalOpen(true); };

  const remove = async (id) => {
    if (!confirm('Deactivate this client?')) return;
    await dispatch(deleteClient(id)).unwrap();
    dispatch(showToast({message:'Client deactivated',type:'success'}));
  };

  const INITIALS = (name) => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const BG_COLORS = ['#4F46E5','#7C3AED','#059669','#CA8A04','#0EA5E9','#DC2626','#D946EF','#16A34A'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">{clients.length} active clients</div>
        {canManage && <Button onClick={openNew}>+ Add Client</Button>}
      </div>

      {loading && <div className="text-center py-12 text-gray-400 text-sm">Loading clients…</div>}
      <div className="grid grid-cols-3 gap-4">
        {clients.map((c, idx) => (
          <div key={c.id} className="card p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              {c.logo_url
                ? <img src={c.logo_url} alt={c.name} className="w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-100" />
                : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: BG_COLORS[idx % BG_COLORS.length] }}>{INITIALS(c.name)}</div>
              }
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{c.name}</div>
                {c.email && <div className="text-xs text-gray-400 truncate">{c.email}</div>}
                {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
              </div>
            </div>
            {c.notes && <div className="text-xs text-gray-500 mb-4 line-clamp-2">{c.notes}</div>}
            {canManage && (
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" className="flex-1 justify-center" onClick={()=>openEdit(c)}>Edit</Button>
                <Button size="xs" variant="danger" onClick={()=>remove(c.id)}>Remove</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && <ClientModal client={modalClient} open={modalOpen} onClose={()=>setModalOpen(false)} />}
    </div>
  );
}

export default function ClientsPage() {
  return <><Topbar title="Clients" /><ClientsContent /></>;
}
