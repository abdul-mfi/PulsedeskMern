const db = require('../../utils/db');

const findFlags = (filters = {}) => {
  let q = db('hr_flags as hf')
    .join('users as fp', 'hf.flagged_person_id', 'fp.id')
    .join('users as fb', 'hf.flagged_by_id', 'fb.id')
    .select('hf.*', 'fp.name as person_name', 'fp.initials as person_initials', 'fp.color as person_color', 'fp.photo_url as person_photo', 'fp.designation as person_designation', 'fb.name as flagged_by_name');
  if (filters.month)  q = q.where('hf.month', filters.month);
  if (filters.status) q = q.where('hf.status', filters.status);
  if (filters.user_id) q = q.where('hf.flagged_person_id', filters.user_id);
  return q.orderBy('hf.created_at', 'desc');
};

const createFlag  = (data) => db('hr_flags').insert(data).returning('*');
const updateFlag  = (id, data) => db('hr_flags').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');
const deleteFlag  = (id) => db('hr_flags').where({ id }).del();

const findAwards = (filters = {}) => {
  let q = db('award_nominations as an')
    .join('users as n',  'an.nominated_id',    'n.id')
    .join('users as nb', 'an.nominated_by_id', 'nb.id')
    .select('an.*', 'n.name as person_name', 'n.initials as person_initials', 'n.color as person_color', 'n.photo_url as person_photo', 'n.designation as person_designation', 'nb.name as nominated_by_name');
  if (filters.month)  q = q.where('an.month', filters.month);
  if (filters.status) q = q.where('an.status', filters.status);
  return q.orderBy('an.created_at', 'desc');
};

const createAward = (data) => db('award_nominations').insert(data).returning('*');
const updateAward = (id, data) => db('award_nominations').where({ id }).update({ ...data, updated_at: db.fn.now() }).returning('*');

module.exports = { findFlags, createFlag, updateFlag, deleteFlag, findAwards, createAward, updateAward };
