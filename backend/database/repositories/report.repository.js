const db = require('../../utils/db');

const getDailyLogs = (date) => {
  const d = new Date(date); d.setHours(0,0,0,0);
  return db('daily_logs as dl').join('users as u','dl.user_id','u.id')
    .leftJoin(db('task_logs').select('daily_log_id', db.raw('count(*) as task_count'), db.raw('sum(actual_hours) as total_hours')).groupBy('daily_log_id').as('tl'), 'dl.id', 'tl.daily_log_id')
    .where('dl.date', d)
    .select('dl.*','u.name','u.initials','u.color','u.photo_url','u.designation','tl.task_count','tl.total_hours');
};

const getWeekLogs = (weekStart) => {
  const start = new Date(weekStart); start.setHours(0,0,0,0);
  const end   = new Date(weekStart); end.setDate(end.getDate() + 4); end.setHours(23,59,59,999);
  return db('daily_logs').whereBetween('date', [start, end]).select('user_id','date','submission_status','productive_hours');
};

const getMonthlyJobData = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);
  return db('jobs').whereBetween('due_date', [start, end]).select('assignee_id','status','due_date','completed_at','scope_hours');
};

const getMonthlyLogs = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0);
  return db('daily_logs').whereBetween('date', [start, end]).select('user_id','submission_status','productive_hours','day_rating');
};

module.exports = { getDailyLogs, getWeekLogs, getMonthlyJobData, getMonthlyLogs };
