const db = require('../../utils/db');
const SAFE = ['id','name','email','role','designation','color','initials','photo_url','is_active','created_at'];

const findAll = (filters = {}) => {
  let q = db('users').select(SAFE);
  if (filters.role)      q = q.where('role', filters.role);
  if (filters.is_active !== undefined) q = q.where('is_active', filters.is_active);
  if (filters.search)    q = q.where(db.raw('LOWER(name) LIKE ?', [`%${filters.search.toLowerCase()}%`]));
  return q.orderBy('name');
};

const findById    = (id)    => db('users').select(SAFE).where({ id }).first();
const findByEmail = (email) => db('users').where({ email: email.toLowerCase() }).first();

const create = (data) => db('users').insert(data).returning(SAFE);
const update = (id, data) => db('users').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning(SAFE);
const softDelete = (id) => db('users').where({ id }).update({ is_active: false, updated_at: db.fn.now() });

const getWorkload = async () => {
  const users = await db('users').select(SAFE).where({ is_active: true }).whereNot('role', 'CLIENT').orderBy('name');
  for (const u of users) {
    u.active_jobs = await db('jobs').where('assignee_id', u.id).whereNotIn('status', ['COMPLETE','PAUSED']).count('id as count').first();
    u.active_job_count = parseInt(u.active_jobs?.count || 0);
    u.capacity = Math.min(200, u.active_job_count * 35);
    u.jobs = await db('jobs').where('assignee_id', u.id).whereNotIn('status', ['COMPLETE','PAUSED']).select('id','title','status','progress','due_date','priority').limit(5);
  }
  return users;
};

module.exports = { findAll, findById, findByEmail, create, update, softDelete, getWorkload };
