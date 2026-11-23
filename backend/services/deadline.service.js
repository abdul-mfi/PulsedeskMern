const db = require('../utils/db');
const { calculateStatus } = require('../utils/date.utils');
const notifSvc = require('./notification.service');

const runWatcher_b = async (io) => {
  const jobs = await db('jobs').whereIn('status', ['ACTIVE','AT_RISK']).select('*');
  for (const job of jobs) {
    const newStatus = calculateStatus(job);
    if (newStatus !== job.status) {
      await db('jobs').where('id', job.id).update({ status: newStatus, updated_at: db.fn.now() });
      if (io) io.emit('job:status:change', { jobId: job.id, status: newStatus });
      if (newStatus === 'OVERDUE') {
        await notifSvc.create({ userId: job.assignee_id, title: '🔴 Deadline missed', message: `"${job.title}" is overdue — request extension or mark complete`, type: 'DANGER', link: `/jobs/${job.id}` });
        await notifSvc.create({ userId: job.created_by, title: '🔴 Job overdue', message: `"${job.title}" has missed its deadline`, type: 'DANGER', link: `/jobs/${job.id}` });
        if (io) io.emit('notification:new', { jobId: job.id, type: 'OVERDUE' });
      } else if (newStatus === 'AT_RISK') {
        await notifSvc.create({ userId: job.assignee_id, title: '🟡 Deadline approaching', message: `"${job.title}" is within 20% of its deadline — update progress`, type: 'WARNING', link: `/jobs/${job.id}` });
        if (io) io.emit('notification:new', { jobId: job.id, type: 'AT_RISK' });
      }
    }
  }
};

const startWatcher_b = (io) => {
  console.log('⏱  Deadline watcher started');
  runWatcher_b(io);
  setInterval(() => runWatcher_b(io), 60 * 1000);
  // Daily digest at 7pm
  setInterval(async () => {
    const h = new Date().getHours(), m = new Date().getMinutes();
    if (h === 19 && m === 0) {
      const [overdue, risk, pending] = await Promise.all([
        db('jobs').where('status','OVERDUE').count('id as c').first(),
        db('jobs').where('status','AT_RISK').count('id as c').first(),
        db('jobs').where('status','PENDING').count('id as c').first(),
      ]);
      const mgrs = await db('users').whereIn('role',['ADMIN','MANAGER']).where('is_active',true).select('id');
      for (const m of mgrs) {
        await notifSvc.create({ userId: m.id, title: '📊 Daily digest', message: `${overdue?.c||0} overdue · ${risk?.c||0} at risk · ${pending?.c||0} pending acceptance`, type: parseInt(overdue?.c||0) > 0 ? 'DANGER' : 'INFO', link: '/dashboard' });
      }
      if (io) io.emit('notification:new', { type: 'DIGEST' });
    }
  }, 60 * 1000);
};

module.exports = { startWatcher_b, runWatcher_b };
