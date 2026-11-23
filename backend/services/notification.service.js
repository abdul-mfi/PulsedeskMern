const db = require('../utils/db');

const create = async ({ userId, title, message, type = 'INFO', link }) => {
  try {
    const [n] = await db('notifications').insert({ user_id: userId, title, message, type, link }).returning('*');
    return n;
  } catch (e) { console.error('[Notif]', e.message); }
};

const notifyMany = async (userIds, payload) => {
  const rows = userIds.map(id => ({ user_id: id, ...payload }));
  if (rows.length) await db('notifications').insert(rows);
};

const notifyRole = async (role, payload) => {
  const users = await db('users').where({ role, is_active: true }).select('id');
  await notifyMany(users.map(u => u.id), payload);
};

module.exports = { create, notifyMany, notifyRole };
