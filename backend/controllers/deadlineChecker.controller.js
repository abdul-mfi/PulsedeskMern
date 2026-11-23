const db = require("../utils/db");
const { success, error } = require("../utils/response.utils");
const { calculateStatus } = require("../utils/date.utils");
const notifSvc = require("../services/notification.service");



exports.checkAndUpdateWorkStatus = async (req, res, next) => {
  try {

    const jobs = await db("jobs")
      .whereIn("status", ["ACTIVE", "AT_RISK"])
      .select("*");

    for (const job of jobs) {
      const newStatus = calculateStatus(job);
      
      if (newStatus !== job.status) {
        
        await db("jobs")
          .where("id", job.id)
          .update({ status: newStatus, updated_at: db.fn.now() });

        // if (newStatus === "OVERDUE") {
        //   await notifSvc.create({
        //     userId: job.assignee_id,
        //     title: "🔴 Deadline missed",
        //     message: `"${job.title}" is overdue — request extension or mark complete`,
        //     type: "DANGER",
        //     link: `/jobs/${job.id}`,
        //   });
        //   await notifSvc.create({
        //     userId: job.created_by,
        //     title: "🔴 Job overdue",
        //     message: `"${job.title}" has missed its deadline`,
        //     type: "DANGER",
        //     link: `/jobs/${job.id}`,
        //   });
        // } else if (newStatus === "AT_RISK") {
        //   await notifSvc.create({
        //     userId: job.assignee_id,
        //     title: "🟡 Deadline approaching",
        //     message: `"${job.title}" is within 20% of its deadline — update progress`,
        //     type: "WARNING",
        //     link: `/jobs/${job.id}`,
        //   });
        // }

      }


    }

    success(res, null, "Deadlines updated", 200);
    
  } catch (e) {
    next(e);
  }
};
