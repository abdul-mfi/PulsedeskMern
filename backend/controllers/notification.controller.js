const db = require("../utils/db");
const { success } = require("../utils/response.utils");
exports.getAll = async (req, res, next) => {
  try {
    success(
      res,
      await db("notifications")
        .where("user_id", req.user.id)
        .where("is_read", false)
        .orderBy("created_at", "desc")
        .limit(50),
    );
  } catch (e) {
    next(e);
  }
};
exports.unreadCount = async (req, res, next) => {
  try {
    const r = await db("notifications")
      .where({ user_id: req.user.id, is_read: false })
      .count("id as count")
      .first();
    success(res, { count: parseInt(r?.count || 0) });
  } catch (e) {
    next(e);
  }
};
exports.markRead = async (req, res, next) => {
  try {
    await db("notifications")
      .where("id", req.params.id)
      .update({ is_read: true });
    success(res, null, "Marked read");
  } catch (e) {
    next(e);
  }
};
exports.markAllRead = async (req, res, next) => {
  try {
    await db("notifications")
      .where({ user_id: req.user.id, is_read: false })
      .update({ is_read: true });
    success(res, null, "All marked read");
  } catch (e) {
    next(e);
  }
};
