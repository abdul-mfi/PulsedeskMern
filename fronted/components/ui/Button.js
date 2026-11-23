'use client';
export default function Button({ children, variant='primary', size='md', className='', disabled=false, onClick, type='button' }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all cursor-pointer border';
  const variants = { primary:'bg-brand text-white border-brand hover:bg-brand-dark', ghost:'bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50', danger:'bg-rose-600 text-white border-rose-600 hover:bg-rose-700', gold:'bg-amber-600 text-white border-amber-600 hover:bg-amber-700' };
  const sizes = { xs:'px-2 py-1 text-xs', sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5 text-sm' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]||variants.primary} ${sizes[size]||sizes.md} ${disabled?'opacity-50 cursor-not-allowed':''} ${className}`}>
      {children}
    </button>
  );
}
