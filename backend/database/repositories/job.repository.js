const db = require('../../utils/db');

const BASE = () => db('jobs as j')
  .leftJoin('clients as c',  'j.client_id',   'c.id')
  .leftJoin('users as a',    'j.assignee_id',  'a.id')
  .leftJoin('users as cr',   'j.created_by',   'cr.id')
  .select(
    'j.*',
    'c.name as client_name','c.logo_url as client_logo',
    'a.name as assignee_name','a.initials as assignee_initials','a.color as assignee_color','a.photo_url as assignee_photo',
    'cr.name as creator_name'
  );

const findAll = (filters = {}) => {
  let q = BASE();
  if (filters.assignee_id) q = q.where('j.assignee_id', filters.assignee_id);
  if (filters.client_id)   q = q.where('j.client_id',   filters.client_id);
  if (filters.status)      q = q.where('j.status',      filters.status);
  if (filters.priority)    q = q.where('j.priority',    filters.priority);
  if (filters.search)      q = q.where(db.raw('LOWER(j.title) LIKE ?', [`%${filters.search.toLowerCase()}%`]));
  return q.orderBy([{ column: 'j.due_date', order: 'asc' }]);
};

const findById = async (id) => {
  const job = await BASE().where('j.id', id).first();
  if (!job) return null;
  job.milestones    = await db('milestones').where('job_id', id).orderBy('order_index');
  job.comments      = await db('job_comments as jc').join('users as u','jc.user_id','u.id').where('jc.job_id', id).select('jc.*','u.name as user_name','u.initials as user_initials','u.color as user_color').orderBy('jc.created_at','desc').limit(50);
  job.activity_logs = await db('job_activity_logs as al').join('users as u','al.user_id','u.id').where('al.job_id', id).select('al.*','u.name as user_name').orderBy('al.created_at','desc').limit(20);
  job.extensions    = await db('deadline_extensions').where('job_id', id).orderBy('created_at','desc');
  return job;
};

const getStats = async (filter = {}) => {
  const q = db('jobs');
  if (filter.assignee_id) q.where('assignee_id', filter.assignee_id);
  const rows = await q.select('status', db.raw('count(*) as count')).groupBy('status');
  const stats = { total: 0, active: 0, at_risk: 0, overdue: 0, pending: 0, in_review: 0, complete: 0, paused: 0 };
  rows.forEach(r => { stats[r.status.toLowerCase()] = parseInt(r.count); stats.total += parseInt(r.count); });
  return stats;
};

const create = (data) => db('jobs').insert(data).returning('*');
const update = (id, data) => db('jobs').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');
const remove = (id) => db('jobs').where({ id }).del();

const logActivity = (jobId, userId, action, details = null) =>
  db('job_activity_logs').insert({ job_id: jobId, user_id: userId, action, details: details ? JSON.stringify(details) : null });

module.exports = { findAll, findById, getStats, create, update, remove, logActivity };
