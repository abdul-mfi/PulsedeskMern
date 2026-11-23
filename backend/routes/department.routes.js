const r = require('express').Router();
const c = require('../controllers/department.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isManager } = require('../middleware/role.middleware');
r.get('/', authenticate, c.getAll);
r.post('/', authenticate, isAdmin, c.create);
r.patch('/:id', authenticate, isManager, c.update);
r.delete('/:id', authenticate, isAdmin, c.remove);
module.exports = r;
