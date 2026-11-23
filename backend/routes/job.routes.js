const r = require('express').Router();
const c = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isManager } = require('../middleware/role.middleware');
r.get('/', authenticate, c.getAll);
r.get('/stats', authenticate, c.getStats);
r.get('/:id', authenticate, c.getOne);
r.post('/', authenticate, isManager, c.create);
r.patch('/:id', authenticate, c.update);
r.delete('/:id', authenticate, isManager, c.remove);
r.post('/:id/accept', authenticate, c.accept);
r.post('/:id/reject', authenticate, c.reject);
r.post('/:id/complete', authenticate, c.complete);
r.post('/:id/pause', authenticate, isManager, c.pause);
r.post('/:id/resume', authenticate, isManager, c.resume);
r.post('/:id/request-extension', authenticate, c.requestExtension);
r.patch('/:id/extension/:extId', authenticate, isManager, c.handleExtension);
r.post('/:id/comments', authenticate, c.addComment);
r.get('/:id/comments', authenticate, c.getComments);

r.post('/:id/approve',                authenticate, isManager, c.approve);        // ← NEW: manager marks COMPLETE
r.post('/:id/reject-review',          authenticate, isManager, c.rejectReview);   // ← NEW: manager sends back
module.exports = r;
