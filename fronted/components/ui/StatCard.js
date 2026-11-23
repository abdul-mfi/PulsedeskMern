'use client';
export default function StatCard({ label, value, sub, dotColor, onClick }) {
  return (
    <div className="card p-4 cursor-pointer hover:border-gray-300 transition-colors" onClick={onClick}>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
        {dotColor && <span className="w-2 h-2 rounded-full" style={{ background: dotColor }}></span>}
        {label}
      </div>
      <div className="text-2xl font-bold font-mono leading-none">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
