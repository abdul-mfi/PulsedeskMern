const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { generateTokens, verifyRefresh } = require('../utils/jwt.utils');

const login = async (email, password) => {
  const user = await db('users').where({ email: email.toLowerCase() }).first();
  if (!user || !user.is_active) throw { statusCode: 401, message: 'Invalid credentials' };
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { statusCode: 401, message: 'Invalid credentials' };
  const { accessToken, refreshToken } = generateTokens(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db('refresh_tokens').insert({ token: refreshToken, user_id: user.id, expires_at: expiresAt });
  const { password: _, ...safe } = user;
  return { accessToken, refreshToken, user: safe };
};

const refresh = async (token) => {
  const stored = await db('refresh_tokens').where({ token }).first();
  if (!stored || new Date(stored.expires_at) < new Date()) throw { statusCode: 401, message: 'Invalid or expired refresh token' };
  const decoded = verifyRefresh(token);
  const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.id);
  await db('refresh_tokens').where({ token }).del();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db('refresh_tokens').insert({ token: newRefresh, user_id: decoded.id, expires_at: expiresAt });
  return { accessToken, refreshToken: newRefresh };
};

const logout = async (token) => {
  if (token) await db('refresh_tokens').where({ token }).del();
};

module.exports = { login, refresh, logout };
