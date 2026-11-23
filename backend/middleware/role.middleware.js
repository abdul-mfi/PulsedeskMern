const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Required: ${roles.join(' or ')}` });
  }
  next();
};

const isAdmin   = requireRole('ADMIN');
const isManager = requireRole('ADMIN', 'MANAGER');
const isHR      = requireRole('ADMIN', 'MANAGER', 'HR');

module.exports = { requireRole, isAdmin, isManager, isHR };
