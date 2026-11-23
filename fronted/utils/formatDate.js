export const fmtDate = (d, opts = {}) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', ...opts }) : '—';

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '—';

export const fmtRelative = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000)   return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000)return `${Math.floor(diff/3600000)}h ago`;
  return `${Math.floor(diff/86400000)}d ago`;
};

export const getCurrentMonth = () => new Date().toISOString().slice(0,7);
