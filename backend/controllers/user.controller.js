const userRepo = require("../database/repositories/user.repository");
const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response.utils");

exports.getAll = async (req, res, next) => {
  try {
    const users = await userRepo.findAll(req.query);
    success(res, users);
  } catch (e) {
    next(e);
  }
};

exports.getWorkload = async (req, res, next) => {
  try {
    const data = await userRepo.getWorkload();
    success(res, data);
  } catch (e) {
    next(e);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);
    user.jobs = await db("jobs")
      .where("assignee_id", user.id)
      .select("id", "title", "status", "progress", "due_date", "priority")
      .orderBy("due_date");
    success(res, user);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, designation, color } = req.body;
    if (!name || !email) return error(res, "Name and email required", 400);
    const hashed = await bcrypt.hash(password || "Welcome@123", 12);
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const [user] = await userRepo.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "EMPLOYEE",
      designation,
      color: color || "#4F46E5",
      initials,
    });
    const { password: _, ...safe } = user;
    success(res, safe, "User created", 201);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.id !== req.params.id)
      return error(res, "Not authorized", 403);
    const { name, designation, color, photo_url, is_active, role } = req.body;
    const updates = {};
    if (name) {
      updates.name = name;
      updates.initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (designation) updates.designation = designation;
    if (color) updates.color = color;
    if (photo_url) updates.photo_url = photo_url;
    if (req.user.role === "ADMIN") {
      if (is_active !== undefined) updates.is_active = is_active;
      if (role) updates.role = role;
    }
    const [updated] = await userRepo.update(req.params.id, updates);
    success(res, updated);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await userRepo.softDelete(req.params.id);
    success(res, null, "User deactivated");
  } catch (e) {
    next(e);
  }
};
