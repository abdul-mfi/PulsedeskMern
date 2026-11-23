const hrRepo = require("../database/repositories/hr.repository");
const notifSvc = require("../services/notification.service");
const db = require("../utils/db");
const { success, error } = require("../utils/response.utils");
const { getCurrentMonth } = require("../utils/date.utils");

exports.getFlags = async (req, res, next) => {
  try {
    success(res, await hrRepo.findFlags(req.query));
  } catch (e) {
    next(e);
  }
};
exports.createFlag = async (req, res, next) => {
  try {
    const { flagged_person_id, reason, severity, details, recommended_action } =
      req.body;
    if (!flagged_person_id || !reason)
      return error(res, "flagged_person_id and reason required", 400);
    const [flag] = await hrRepo.createFlag({
      flagged_person_id,
      flagged_by_id: req.user.id,
      reason,
      severity: severity || "ADVISORY",
      details,
      recommended_action,
      month: getCurrentMonth(),
    });
    await notifSvc.notifyRole("HR", {
      title: "New HR flag raised",
      message: `${req.user.name} flagged an employee — ${severity || "ADVISORY"}`,
      type: "WARNING",
      link: "/monthly-performance",
    });
    success(res, flag, "Flag created", 201);
  } catch (e) {
    next(e);
  }
};
exports.updateFlag = async (req, res, next) => {
  try {
    const [f] = await hrRepo.updateFlag(req.params.id, req.body);
    success(res, f);
  } catch (e) {
    next(e);
  }
};
exports.deleteFlag = async (req, res, next) => {
  try {
    await hrRepo.deleteFlag(req.params.id);
    success(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
};
exports.getAwards = async (req, res, next) => {
  try {
    success(res, await hrRepo.findAwards(req.query));
  } catch (e) {
    next(e);
  }
};
exports.nominate = async (req, res, next) => {
  try {
    const { nominated_id, category, reason } = req.body;
    if (!nominated_id || !category || !reason)
      return error(res, "nominated_id, category, reason required", 400);
    const [award] = await hrRepo.createAward({
      nominated_id,
      nominated_by_id: req.user.id,
      category,
      reason,
      month: getCurrentMonth(),
    });
    await notifSvc.notifyRole("HR", {
      title: "New award nomination",
      message: `${req.user.name} nominated someone for ${category.replace(/_/g, " ")}`,
      type: "SUCCESS",
    });
    success(res, award, "Nomination submitted", 201);
  } catch (e) {
    next(e);
  }
};
exports.updateAward = async (req, res, next) => {
  try {
    const [a] = await hrRepo.updateAward(req.params.id, {
      ...req.body,
      approved_at: req.body.status === "APPROVED" ? new Date() : null,
    });
    if (req.body.status === "APPROVED")
      await notifSvc.create({
        userId: a.nominated_id,
        title: "🏆 Award nomination approved!",
        message: `You will be recognised at the quarterly team review`,
        type: "SUCCESS",
      });
    success(res, a);
  } catch (e) {
    next(e);
  }
};
