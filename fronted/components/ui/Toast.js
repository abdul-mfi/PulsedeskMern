'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../../store/slices/uiSlice';
export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector(s => s.ui.toast);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => dispatch(hideToast()), toast.duration || 3000); return () => clearTimeout(t); }
  }, [toast, dispatch]);
  if (!toast) return null;
  const colors = { success:'bg-green-600', error:'bg-red-600', info:'bg-gray-800', warning:'bg-amber-600' };
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${colors[toast.type]||'bg-gray-800'} text-white px-4 py-3 rounded-xl shadow-2xl text-sm max-w-xs animate-in slide-in-from-bottom-4 duration-200`}>
      {toast.message}
    </div>
  );
}
