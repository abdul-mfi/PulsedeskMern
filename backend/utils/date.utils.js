const getDaysLeft = (dueDate) =>
  Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));

const calculateStatus = (job) => {
  if (['COMPLETE','PAUSED','IN_REVIEW','PENDING'].includes(job.status)) return job.status;
  const now = new Date(), due = new Date(job.due_date);
  const start = job.start_date ? new Date(job.start_date) : new Date(job.created_at);
  const total = due - start, remaining = due - now;
  if (remaining < 0) return 'OVERDUE';
  if (remaining / total <= 0.20) return 'AT_RISK';
  return 'ACTIVE';
};

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

module.exports = { getDaysLeft, calculateStatus, getCurrentMonth };
