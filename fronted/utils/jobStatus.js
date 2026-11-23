export const STATUS_CONFIG = {
  ACTIVE:    { label:'On track',  cls:'status-green',  color:'#16A34A', dot:'bg-green-500' },
  AT_RISK:   { label:'At risk',   cls:'status-yellow', color:'#CA8A04', dot:'bg-yellow-500' },
  OVERDUE:   { label:'Overdue',   cls:'status-red',    color:'#DC2626', dot:'bg-red-500' },
  PENDING:   { label:'Pending',   cls:'status-blue',   color:'#2563EB', dot:'bg-blue-500' },
  PAUSED:    { label:'Paused',    cls:'status-grey',   color:'#6B7280', dot:'bg-gray-400' },
  IN_REVIEW: { label:'In review', cls:'status-purple', color:'#7C3AED', dot:'bg-purple-500' },
  COMPLETE:  { label:'Complete',  cls:'status-green',  color:'#16A34A', dot:'bg-green-500' },
};

export const TIER_CONFIG = {
  STAR:   { label:'⭐ Star performer', color:'#D97706', bg:'bg-amber-50',  border:'border-amber-200', text:'text-amber-700' },
  STRONG: { label:'✓ Strong',         color:'#16A34A', bg:'bg-green-50',  border:'border-green-200', text:'text-green-700' },
  RISK:   { label:'⚠ At risk',        color:'#F97316', bg:'bg-orange-50', border:'border-orange-200',text:'text-orange-700' },
  FLAG:   { label:'🚩 HR flagged',    color:'#BE123C', bg:'bg-rose-50',   border:'border-rose-200',  text:'text-rose-700'  },
};

export const getDaysLeft = (dueDate) =>
  Math.ceil((new Date(dueDate) - new Date()) / (1000*60*60*24));

export const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.PAUSED;
