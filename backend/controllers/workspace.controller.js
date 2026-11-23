const db = require("../utils/db");
const { success } = require("../utils/response.utils");
exports.getSettings = async (req, res, next) => {
  try {
    const rows = await db("workspace_settings");
    const obj = {};
    rows.forEach((r) => {
      obj[r.key] = r.value;
    });
    success(res, obj);
  } catch (e) {
    next(e);
  }
};
exports.updateSettings = async (req, res, next) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db("workspace_settings")
        .insert({ key, value })
        .onConflict("key")
        .merge({ value, updated_at: db.fn.now() });
    }
    success(res, null, "Settings updated");
  } catch (e) {
    next(e);
  }
};
