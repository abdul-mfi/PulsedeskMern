const r = require('express').Router();
const c = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isManager } = require('../middleware/role.middleware');
r.get('/daily', authenticate, isManager, c.daily);
r.get('/weekly', authenticate, isManager, c.weekly);
r.get('/monthly', authenticate, isManager, c.monthly);
module.exports = r;
