const r = require('express').Router();
const c = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
r.get('/', authenticate, c.getAll);
r.get('/unread-count', authenticate, c.unreadCount);
r.patch('/read-all', authenticate, c.markAllRead);
r.patch('/:id/read', authenticate, c.markRead);
module.exports = r;
