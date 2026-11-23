const r = require('express').Router();
const c = require('../controllers/workspace.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');
r.get('/settings', authenticate, c.getSettings);
r.patch('/settings', authenticate, isAdmin, c.updateSettings);
module.exports = r;
