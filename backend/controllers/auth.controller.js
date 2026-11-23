const authSvc = require("../services/auth.service");
const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response.utils");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return error(res, "Email and password required", 400);
    const result = await authSvc.login(email, password);
    success(res, result, "Login successful");
  } catch (e) {
    next(e);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, "Refresh token required", 400);
    const result = await authSvc.refresh(refreshToken);
    success(res, result, "Token refreshed");
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authSvc.logout(req.body.refreshToken);
    success(res, null, "Logged out successfully");
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res) => success(res, req.user);

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db("users").where("id", req.user.id).first();
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return error(res, "Current password incorrect", 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await db("users")
      .where("id", req.user.id)
      .update({ password: hashed, updated_at: db.fn.now() });
    success(res, null, "Password updated");
  } catch (e) {
    next(e);
  }
};
