const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (err.code === '23505') return res.status(409).json({ success: false, message: 'Duplicate record — value already exists' });
  if (err.code === '23503') return res.status(400).json({ success: false, message: 'Referenced record not found' });
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
