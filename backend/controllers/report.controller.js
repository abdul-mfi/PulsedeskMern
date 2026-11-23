const db = require("../utils/db");
const { success } = require("../utils/response.utils");
const rRepo = require("../database/repositories/report.repository");

exports.daily = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const allUsers = await db("users")
      .where({ is_active: true })
      .whereNot("role", "CLIENT")
      .select("id", "name", "initials", "color", "photo_url", "designation");
    const logs = await rRepo.getDailyLogs(date);
    const logMap = {};
    logs.forEach((l) => {
      logMap[l.user_id] = l;
    });
    const members = allUsers.map((u) => ({
      user: u,
      log: logMap[u.id] || null,
      status: logMap[u.id]?.submission_status || "MISSED",
      hours_logged: parseFloat(logMap[u.id]?.total_hours || 0),
      task_count: parseInt(logMap[u.id]?.task_count || 0),
      efficiency: logMap[u.id]?.total_hours
        ? Math.round((logMap[u.id].total_hours / 8) * 100)
        : 0,
    }));
    success(res, {
      date,
      summary: {
        total: allUsers.length,
        submitted: members.filter((m) => m.status === "COMPLETE").length,
        partial: members.filter((m) => m.status === "PARTIAL").length,
        missed: members.filter((m) => m.status === "MISSED").length,
        avg_efficiency: Math.round(
          members.reduce((a, m) => a + m.efficiency, 0) / allUsers.length,
        ),
      },
      members,
    });
  } catch (e) {
    next(e);
  }
};

exports.weekly = async (req, res, next) => {
  try {
    const start = req.query.week_start
      ? new Date(req.query.week_start)
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
    const logs = await rRepo.getWeekLogs(start);
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
    const members = allUsers.map((u) => {
      const ul = logs.filter((l) => l.user_id === u.id);
      const dayBreakdown = days.map((day) => {
        const l = ul.find(
          (x) => new Date(x.date).toDateString() === day.toDateString(),
        );
        return {
          date: day,
          status:
            l?.submission_status || (day > new Date() ? "FUTURE" : "MISSED"),
        };
      });
      const done = dayBreakdown.filter((d) => d.status === "COMPLETE").length,
        partial = dayBreakdown.filter((d) => d.status === "PARTIAL").length,
        missed = dayBreakdown.filter((d) => d.status === "MISSED").length;
      return {
        user: u,
        days: dayBreakdown,
        done,
        partial,
        missed,
        total_hours: ul
          .reduce((a, l) => a + (l.productive_hours || 0), 0)
          .toFixed(1),
        attendance_rate: Math.round(((done + partial) / 5) * 100),
        week_status:
          missed >= 2 ? "AT_RISK" : partial >= 2 ? "PARTIAL" : "FULL",
      };
    });
    success(res, {
      week_start: start,
      week_end: end,
      summary: {
        full_week: members.filter((m) => m.week_status === "FULL").length,
        partial_week: members.filter((m) => m.week_status === "PARTIAL").length,
        at_risk: members.filter((m) => m.week_status === "AT_RISK").length,
        avg_attendance: Math.round(
          members.reduce((a, m) => a + m.attendance_rate, 0) / allUsers.length,
        ),
      },
      members,
    });
  } catch (e) {
    next(e);
  }
};

exports.monthly = async (req, res, next) => {
  try {
    const monthStr = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, month] = monthStr.split("-").map(Number);
    const allUsers = await db("users")
      .where({ is_active: true })
      .whereNot("role", "CLIENT")
      .select("id", "name", "initials", "color", "photo_url", "designation");
    const [logs, jobs, flags, awards] = await Promise.all([
      rRepo.getMonthlyLogs(year, month),
      rRepo.getMonthlyJobData(year, month),
      db("hr_flags")
        .where("month", monthStr)
        .select("flagged_person_id", "severity", "status"),
      db("award_nominations")
        .where("month", monthStr)
        .select("nominated_id", "category", "status"),
    ]);
    const WD = 22;
    const scores = allUsers
      .map((u) => {
        const ul = logs.filter((l) => l.user_id === u.id),
          uj = jobs.filter((j) => j.assignee_id === u.id);
        const submitted = ul.filter(
          (l) => l.submission_status === "COMPLETE",
        ).length;
        const attendance = Math.round((submitted / WD) * 100);
        const done = uj.filter((j) => j.status === "COMPLETE").length,
          missed = uj.filter((j) => j.status === "OVERDUE").length;
        const ontime =
          uj.length > 0
            ? Math.round(
                (uj.filter(
                  (j) =>
                    j.status === "COMPLETE" && j.completed_at <= j.due_date,
                ).length /
                  uj.length) *
                  100,
              )
            : 80;
        const avgRating =
          ul.length > 0
            ? ul.reduce((a, l) => a + (l.day_rating || 3), 0) / ul.length
            : 3;
        const score = Math.round(
          attendance * 0.3 +
            Math.round((submitted / WD) * 100) * 0.3 +
            ontime * 0.3 +
            (avgRating / 5) * 100 * 0.1,
        );
        const tier =
          score >= 90
            ? "STAR"
            : score >= 75
              ? "STRONG"
              : score >= 50
                ? "RISK"
                : "FLAG";
        return {
          user: u,
          score,
          tier,
          attendance,
          completion: Math.round((submitted / WD) * 100),
          ontime,
          jobs_done: done,
          jobs_missed: missed,
          submissions: submitted,
          total_submissions: WD,
          hr_flagged: flags.some(
            (f) => f.flagged_person_id === u.id && f.status === "ACTIVE",
          ),
          awards: awards.filter((a) => a.nominated_id === u.id),
        };
      })
      .sort((a, b) => b.score - a.score);
    const activeFlags = await db("hr_flags as hf")
      .join("users as fp", "hf.flagged_person_id", "fp.id")
      .join("users as fb", "hf.flagged_by_id", "fb.id")
      .where("hf.month", monthStr)
      .where("hf.status", "ACTIVE")
      .select(
        "hf.*",
        "fp.name as person_name",
        "fp.initials as person_initials",
        "fp.color as person_color",
        "fp.designation as person_designation",
        "fb.name as flagged_by_name",
      )
      .orderBy("hf.created_at", "desc");
    success(res, {
      month: monthStr,
      summary: {
        total: allUsers.length,
        star: scores.filter((s) => s.tier === "STAR").length,
        strong: scores.filter((s) => s.tier === "STRONG").length,
        risk: scores.filter((s) => s.tier === "RISK").length,
        flagged: scores.filter((s) => s.hr_flagged).length,
        avg_score: Math.round(
          scores.reduce((a, s) => a + s.score, 0) / scores.length,
        ),
      },
      leaderboard: scores,
      hr_flags: activeFlags,
    });
  } catch (e) {
    next(e);
  }
};
