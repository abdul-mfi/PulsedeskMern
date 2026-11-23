'use client';
const SIZES = { sm:'w-6 h-6 text-xs', md:'w-8 h-8 text-sm', lg:'w-10 h-10 text-base', xl:'w-12 h-12 text-lg', '2xl':'w-14 h-14 text-xl' };
export default function Avatar({ user, size='md', className='' }) {
  const s = SIZES[size] || SIZES.md;
  if (!user) return <div className={`${s} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>?</div>;
  if (user.photo_url) return <img src={user.photo_url} alt={user.name} className={`${s} rounded-full object-cover border-2 border-white ${className}`} />;
  return <div className={`${s} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`} style={{ background: user.color || '#4F46E5' }}>{user.initials || '?'}</div>;
}
