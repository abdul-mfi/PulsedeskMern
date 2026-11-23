const db = require("../utils/db");
const { success, error } = require("../utils/response.utils");

exports.getAll = async (req, res, next) => {
  try {
    success(
      res,
      await db("departments").where("is_active", true).orderBy("name"),
    );
  } catch (e) {
    next(e);
  }
};
exports.create = async (req, res, next) => {
  try {
    const [d] = await db("departments").insert(req.body).returning("*");
    success(res, d, "Created", 201);
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const [d] = await db("departments")
      .where("id", req.params.id)
      .update({ ...req.body, updated_at: db.fn.now() })
      .returning("*");
    success(res, d);
  } catch (e) {
    next(e);
  }
};
exports.remove = async (req, res, next) => {
  try {
    await db("departments")
      .where("id", req.params.id)
      .update({ is_active: false });
    success(res, null, "Deleted");
  } catch (e) {
    next(e);
  }
};
