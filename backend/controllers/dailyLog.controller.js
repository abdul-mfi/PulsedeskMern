const db = require("../utils/db");
const { success, error } = require("../utils/response.utils");

exports.checkin = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await db("daily_logs")
      .where({ user_id: req.user.id, date: today })
      .first();
    if (existing) return error(res, "Already checked in today", 409);
    const {
      work_mode,
      day_type,
      clients,
      priority_client,
      top_goals,
      blockers,
      mood_score,
      task_logs,
    } = req.body;
    const [log] = await db("daily_logs")
      .insert({
        user_id: req.user.id,
        date: today,
        check_in_time: new Date(),
        work_mode: work_mode || "IN_OFFICE",
        day_type,
        clients,
        priority_client,
        top_goals,
        blockers,
        mood_score,
        submission_status: "PARTIAL",
      })
      .returning("*");
    if (task_logs?.length) {
      await db("task_logs").insert(
        task_logs.map((t) => ({
          daily_log_id: log.id,
          task_name: t.task_name,
          planned_hours: t.planned_hours || 0,
          priority: t.priority,
          notes: t.notes,
          client_name: t.client_name,
        })),
      );
    }
    success(res, log, "Checked in", 201);
  } catch (e) {
    next(e);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const log = await db("daily_logs")
      .where({ user_id: req.user.id, date: today })
      .first();
    if (!log)
      return error(res, "No check-in found — please check in first", 404);
    const {
      accomplishments,
      pending_work,
      productive_hours,
      day_rating,
      challenges,
      tomorrow_plan,
      flag_to_manager,
      task_logs,
    } = req.body;
    const [updated] = await db("daily_logs")
      .where("id", log.id)
      .update({
        check_out_time: new Date(),
        accomplishments,
        pending_work,
        productive_hours,
        day_rating,
        challenges,
        tomorrow_plan,
        flag_to_manager,
        submission_status: "COMPLETE",
        updated_at: db.fn.now(),
      })
      .returning("*");
    if (task_logs?.length) {
      for (const t of task_logs) {
        if (t.id)
          await db("task_logs")
            .where("id", t.id)
            .update({
              actual_hours: t.actual_hours || 0,
              completion: t.completion || 0,
              status: t.status,
              notes: t.notes,
              updated_at: db.fn.now(),
            });
      }
    }
    success(res, updated, "Checked out");
  } catch (e) {
    next(e);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const { date, user_id, from, to } = req.query;
    let q = db("daily_logs as dl")
      .join("users as u", "dl.user_id", "u.id")
      .select(
        "dl.*",
        "u.name",
        "u.initials",
        "u.color",
        "u.photo_url",
        "u.designation",
      );
    if (req.user.role === "EMPLOYEE") q = q.where("dl.user_id", req.user.id);
    else if (user_id) q = q.where("dl.user_id", user_id);
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      q = q.where("dl.date", d);
    } else if (from || to) {
      if (from) q = q.where("dl.date", ">=", new Date(from));
      if (to) q = q.where("dl.date", "<=", new Date(to));
    }
    const logs = await q.orderBy("dl.date", "desc");
    success(res, logs);
  } catch (e) {
    next(e);
  }
};

exports.todaySummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allUsers = await db("users")
      .where({ is_active: true })
      .whereNot("role", "CLIENT")
      .select("id", "name", "initials", "color", "photo_url", "designation");
    const logs = await db("daily_logs")
      .where("date", today)
      .select(
        "user_id",
        "submission_status",
        "productive_hours",
        "check_in_time",
        "check_out_time",
      );
    const logMap = {};
    logs.forEach((l) => {
      logMap[l.user_id] = l;
    });
    const summary = allUsers.map((u) => ({
      user: u,
      log: logMap[u.id] || null,
      status: logMap[u.id]?.submission_status || "MISSED",
    }));
    success(res, {
      date: today,
      summary,
      counts: {
        submitted: summary.filter((s) => s.status === "COMPLETE").length,
        partial: summary.filter((s) => s.status === "PARTIAL").length,
        missed: summary.filter((s) => s.status === "MISSED").length,
        total: allUsers.length,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.weekHeatmap = async (req, res, next) => {
  try {
    const { week_start } = req.query;
    const start = week_start
      ? new Date(week_start)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - d.getDay() + 1);
          d.setHours(0, 0, 0, 0);
          return d;
        })();
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    end.setHours(23, 59, 59, 999);
    const allUsers = await db("users")
      .where({ is_active: true })
      .whereNot("role", "CLIENT")
      .select("id", "name", "initials", "color", "photo_url", "designation");
    const logs = await db("daily_logs")
      .whereBetween("date", [start, end])
      .select("user_id", "date", "submission_status");
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
    const heatmap = allUsers.map((u) => {
      const ul = logs.filter((l) => l.user_id === u.id);
      return {
        user: u,
        days: days.map((day) => {
          const l = ul.find(
            (x) => new Date(x.date).toDateString() === day.toDateString(),
          );
          return {
            date: day,
            status:
              l?.submission_status || (day > new Date() ? "FUTURE" : "MISSED"),
          };
        }),
      };
    });
    success(res, { week_start: start, week_end: end, heatmap });
  } catch (e) {
    next(e);
  }
};

exports.getTaskLogs = async (req, res, next) => {
  try {
    const tasks = await db('task_logs')
      .where('daily_log_id', req.params.id)
      .orderBy('created_at', 'asc');
    success(res, tasks);
  } catch (e) { next(e); }
};

// GET /api/daily-logs/my-today
// Returns the current user's log for today (used on checkin/checkout pages)
exports.getMyToday = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const log = await db('daily_logs')
      .where({ user_id: req.user.id, date: today })
      .first();
    if (!log) return success(res, null); // null = not checked in yet
    const tasks = await db('task_logs').where('daily_log_id', log.id).orderBy('created_at');
    success(res, { ...log, task_logs: tasks });
  } catch (e) { next(e); }
};
