'use client';
export default function RingProgress({ percent, color, size=40, strokeWidth=3.5, label }) {
  const r = (size - strokeWidth * 2 - 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E4E7EF" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      {label && <span className="absolute text-xs font-semibold font-mono" style={{ color }}>{label}</span>}
    </div>
  );
}
