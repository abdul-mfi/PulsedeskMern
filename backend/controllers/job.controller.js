const jobRepo = require("../database/repositories/job.repository");
const db = require("../utils/db");
const notifSvc = require("../services/notification.service");
const { success, error } = require("../utils/response.utils");
const { getDaysLeft } = require("../utils/date.utils");

const enrich = (job) => ({ ...job, days_left: getDaysLeft(job.due_date) });

exports.getAll = async (req, res, next) => {
  try {
    const filters = { ...req.query };
    if (req.user.role === "EMPLOYEE") filters.assignee_id = req.user.id;
    const jobs = await jobRepo.findAll(filters);
    success(res, jobs.map(enrich));
  } catch (e) {
    next(e);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "EMPLOYEE" ? { assignee_id: req.user.id } : {};
    success(res, await jobRepo.getStats(filter));
  } catch (e) {
    next(e);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const job = await jobRepo.findById(req.params.id);
    if (!job) return error(res, "Job not found", 404);
    if (req.user.role === "EMPLOYEE" && job.assignee_id !== req.user.id)
      return error(res, "Not authorized", 403);
    success(res, enrich(job));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      client_id,
      assignee_id,
      type,
      priority,
      scope_hours,
      working_days,
      story_points,
      due_date,
      description,
      milestones,
    } = req.body;
    if (!title || !assignee_id || !scope_hours || !due_date)
      return error(
        res,
        "title, assignee_id, scope_hours, due_date required",
        400,
      );
    const [job] = await jobRepo.create({
      title,
      client_id,
      assignee_id,
      created_by: req.user.id,
      type: type || "OTHER",
      priority: priority || "MEDIUM",
      scope_hours: parseInt(scope_hours),
      working_days: parseInt(working_days || 7),
      story_points: story_points ? parseInt(story_points) : null,
      due_date: new Date(due_date),
      description,
      milestones,
      status: "PENDING",
    });
    await jobRepo.logActivity(job.id, req.user.id, "JOB_CREATED", { title });
    await notifSvc.create({
      userId: assignee_id,
      title: "New job assigned",
      message: `"${title}" — review and accept to start the clock`,
      type: "INFO",
      link: `/jobs/${job.id}`,
    });
    req.app.get("io")?.emit("job:created", enrich(job));
    success(res, enrich(job), "Job created", 201);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const job = await db("jobs").where("id", req.params.id).first();
    if (!job) return error(res, "Job not found", 404);
    if (req.user.role === "EMPLOYEE" && job.assignee_id !== req.user.id)
      return error(res, "Not authorized", 403);
    const allowed = ["progress", "status", "priority", "description"];
    if (["ADMIN", "MANAGER"].includes(req.user.role))
      allowed.push(
        "title",
        "client_id",
        "assignee_id",
        "due_date",
        "scope_hours",
        "working_days",
      );
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    const [updated] = await jobRepo.update(req.params.id, updates);
    await jobRepo.logActivity(job.id, req.user.id, "JOB_UPDATED", updates);
    req.app.get("io")?.emit("job:updated", enrich(updated));
    success(res, enrich(updated));
  } catch (e) {
    next(e);
  }
};

exports.accept = async (req, res, next) => {
  try {
    const job = await db("jobs").where("id", req.params.id).first();
    if (!job) return error(res, "Job not found", 404);
    if (job.assignee_id !== req.user.id) return error(res, "Not your job", 403);
    if (job.status !== "PENDING")
      return error(res, "Job already accepted", 400);
    const [updated] = await jobRepo.update(req.params.id, {
      status: "ACTIVE",
      start_date: new Date(),
      accepted_at: new Date(),
    });
    await jobRepo.logActivity(job.id, req.user.id, "JOB_ACCEPTED");
    await notifSvc.create({
      userId: job.created_by,
      title: "Job accepted",
      message: `${req.user.name} accepted "${job.title}" — clock is running`,
      type: "SUCCESS",
      link: `/jobs/${job.id}`,
    });
    req.app.get("io")?.emit("job:accepted", enrich(updated));
    success(res, enrich(updated), "Job accepted — clock started");
  } catch (e) {
    next(e);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const job = await db("jobs").where("id", req.params.id).first();
    if (!job) return error(res, "Not found", 404);
    if (job.assignee_id !== req.user.id) return error(res, "Not your job", 403);
    const [updated] = await jobRepo.update(req.params.id, { status: "PAUSED" });
    await jobRepo.logActivity(job.id, req.user.id, "JOB_REJECTED", {
      reason: req.body.reason,
    });
    await notifSvc.create({
      userId: job.created_by,
      title: "Job rejected",
      message: `${req.user.name} rejected "${job.title}" — reassign or review scope`,
      type: "WARNING",
      link: `/jobs/${job.id}`,
    });
    req.app.get("io")?.emit("job:updated", enrich(updated));
    success(res, enrich(updated), "Job rejected");
  } catch (e) {
    next(e);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const job = await db("jobs").where("id", req.params.id).first();
    if (!job) return error(res, "Not found", 404);
    const [updated] = await jobRepo.update(req.params.id, {
      status: "IN_REVIEW",
      progress: 100,
      completed_at: new Date(),
    });
    await notifSvc.create({
      userId: job.created_by,
      title: "Job submitted for review",
      message: `"${job.title}" is complete — awaiting your review`,
      type: "INFO",
      link: `/jobs/${job.id}`,
    });
    req.app.get("io")?.emit("job:completed", enrich(updated));
    success(res, enrich(updated), "Submitted for review");
  } catch (e) {
    next(e);
  }
};

exports.pause = async (req, res, next) => {
  try {
    const [updated] = await jobRepo.update(req.params.id, { status: "PAUSED" });
    req.app.get("io")?.emit("job:updated", enrich(updated));
    success(res, enrich(updated), "Job paused");
  } catch (e) {
    next(e);
  }
};

exports.resume = async (req, res, next) => {
  try {
    const job = await db("jobs").where("id", req.params.id).first();
    const newStatus = job?.progress >= 80 ? "AT_RISK" : "ACTIVE";
    const [updated] = await jobRepo.update(req.params.id, {
      status: newStatus,
    });
    req.app.get("io")?.emit("job:updated", enrich(updated));
    success(res, enrich(updated), "Job resumed");
  } catch (e) {
    next(e);
  }
};

exports.requestExtension = async (req, res, next) => {
  try {
    const { reason, proposed_due_date } = req.body;
    const job = await db("jobs").where("id", req.params.id).first();
    if (!job) return error(res, "Not found", 404);
    const [ext] = await db("deadline_extensions")
      .insert({
        job_id: job.id,
        requested_by: req.user.id,
        reason,
        original_due_date: job.due_date,
        proposed_due_date: new Date(proposed_due_date),
      })
      .returning("*");
    await notifSvc.create({
      userId: job.created_by,
      title: "Extension requested",
      message: `${req.user.name} requests extension on "${job.title}"`,
      type: "WARNING",
      link: `/jobs/${job.id}`,
    });
    success(res, ext, "Extension request sent", 201);
  } catch (e) {
    next(e);
  }
};

exports.handleExtension = async (req, res, next) => {
  try {
    const { status } = req.body;
    const [ext] = await db("deadline_extensions")
      .where("id", req.params.extId)
      .update({
        status,
        approved_at: status === "APPROVED" ? new Date() : null,
        updated_at: db.fn.now(),
      })
      .returning("*");
    if (status === "APPROVED")
      await jobRepo.update(req.params.id, {
        due_date: ext.proposed_due_date,
        status: "ACTIVE",
      });
    success(res, ext);
  } catch (e) {
    next(e);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return error(res, "Content required", 400);
    const [comment] = await db("job_comments")
      .insert({ job_id: req.params.id, user_id: req.user.id, content })
      .returning("*");
    comment.user_name = req.user.name;
    comment.user_initials = req.user.initials;
    comment.user_color = req.user.color;
    req.app.get("io")?.to(req.params.id).emit("comment:new", comment);
    success(res, comment, "Comment added", 201);
  } catch (e) {
    next(e);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await db("job_comments as jc")
      .join("users as u", "jc.user_id", "u.id")
      .where("jc.job_id", req.params.id)
      .select(
        "jc.*",
        "u.name as user_name",
        "u.initials as user_initials",
        "u.color as user_color",
      )
      .orderBy("jc.created_at", "desc");
    success(res, comments);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await jobRepo.remove(req.params.id);
    req.app.get("io")?.emit("job:deleted", { id: req.params.id });
    success(res, null, "Job deleted");
  } catch (e) {
    next(e);
  }
};



// POST /api/jobs/:id/approve
// Admin or Manager marks a job as COMPLETE after reviewing it from IN_REVIEW
// Flow: Employee submits → status becomes IN_REVIEW → Manager/Admin reviews → APPROVE (COMPLETE) or REJECT (back to ACTIVE)
exports.approve = async (req, res, next) => {
  try {
    const job = await db('jobs').where('id', req.params.id).first();
    if (!job) return error(res, 'Job not found', 404);

    if (job.status !== 'IN_REVIEW') {
      return error(res, `Cannot approve — job is currently ${job.status}. Job must be IN_REVIEW to approve.`, 400);
    }

    const { rating, feedback } = req.body; // optional rating 1-5 + feedback comment

    const [updated] = await db('jobs')
      .where('id', req.params.id)
      .update({
        status:       'COMPLETE',
        completed_at: db.fn.now(),
        progress:     100,
        updated_at:   db.fn.now(),
      })
      .returning('*');

    // Log activity
    await db('job_activity_logs').insert({
      job_id:  job.id,
      user_id: req.user.id,
      action:  'JOB_APPROVED',
      details: JSON.stringify({
        approved_by: req.user.name,
        rating:      rating || null,
        feedback:    feedback || null,
      }),
    });

    // If manager left a rating, save it as a comment
    if (feedback) {
      await db('job_comments').insert({
        job_id:  job.id,
        user_id: req.user.id,
        content: `✅ Job approved${rating ? ` — rated ${rating}/5` : ''}. ${feedback}`,
      });
    }

    // Notify the assignee
    await notifSvc.create({
      userId:  job.assignee_id,
      title:   '✅ Job approved!',
      message: `"${job.title}" has been approved and marked complete${rating ? ` with a ${rating}/5 rating` : ''}`,
      type:    'SUCCESS',
      link:    `/jobs/${job.id}`,
    });

    // Emit socket event
    req.app.get('io')?.emit('job:updated', { ...updated, days_left: 0 });
    req.app.get('io')?.emit('job:status:change', { jobId: job.id, status: 'COMPLETE' });

    success(res, updated, 'Job approved and marked complete');
  } catch (e) { next(e); }
};

// POST /api/jobs/:id/reject-review
// Admin or Manager rejects the submission — sends job back to ACTIVE so employee can fix and resubmit
exports.rejectReview = async (req, res, next) => {
  try {
    const job = await db('jobs').where('id', req.params.id).first();
    if (!job) return error(res, 'Job not found', 404);

    if (job.status !== 'IN_REVIEW') {
      return error(res, `Cannot reject — job is not IN_REVIEW`, 400);
    }

    const { reason } = req.body;
    if (!reason?.trim()) return error(res, 'Rejection reason is required', 400);

    const [updated] = await db('jobs')
      .where('id', req.params.id)
      .update({
        status:      'ACTIVE',
        completed_at: null,
        updated_at:  db.fn.now(),
      })
      .returning('*');

    await db('job_activity_logs').insert({
      job_id:  job.id,
      user_id: req.user.id,
      action:  'JOB_REVIEW_REJECTED',
      details: JSON.stringify({ reason, rejected_by: req.user.name }),
    });

    await db('job_comments').insert({
      job_id:  job.id,
      user_id: req.user.id,
      content: `🔄 Sent back for revision: ${reason}`,
    });

    await notifSvc.create({
      userId:  job.assignee_id,
      title:   '🔄 Job sent back for revision',
      message: `"${job.title}" needs changes — ${reason}`,
      type:    'WARNING',
      link:    `/jobs/${job.id}`,
    });

    req.app.get('io')?.emit('job:updated', updated);
    req.app.get('io')?.emit('job:status:change', { jobId: job.id, status: 'ACTIVE' });

    success(res, updated, 'Job sent back for revision');
  } catch (e) { next(e); }
};
