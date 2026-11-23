const db = require("../utils/db");
const { success, error } = require("../utils/response.utils");

exports.getAll = async (req, res, next) => {
  try {
    const clients = await db("clients")
      .where("is_active", true)
      .orderBy("name");
    success(res, clients);
  } catch (e) {
    next(e);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const client = await db("clients").where("id", req.params.id).first();
    if (!client) return error(res, "Client not found", 404);
    client.jobs = await db("jobs")
      .where("client_id", client.id)
      .select("id", "title", "status", "progress", "due_date")
      .orderBy("due_date");
    success(res, client);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, logo_url, notes } = req.body;
    if (!name) return error(res, "Client name required", 400);
    const [client] = await db("clients")
      .insert({ name, email, phone, logo_url, notes })
      .returning("*");
    success(res, client, "Client created", 201);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [updated] = await db("clients")
      .where("id", req.params.id)
      .update({ ...req.body, updated_at: db.fn.now() })
      .returning("*");
    success(res, updated);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await db("clients")
      .where("id", req.params.id)
      .update({ is_active: false, updated_at: db.fn.now() });
    success(res, null, "Client deactivated");
  } catch (e) {
    next(e);
  }
};
