const { verifyAccess } = require('../utils/jwt.utils');
const db = require('../utils/db');

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token provided' });
    const token = auth.split(' ')[1];
    const decoded = verifyAccess(token);
    const user = await db('users').where({ id: decoded.id, is_active: true }).select('id','name','email','role','color','initials','photo_url','designation').first();
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    return res.status(401).json({ success: false, message: msg, code });
  }
};

module.exports = { authenticate };
