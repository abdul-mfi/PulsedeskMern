const r = require('express').Router();
const c = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
r.post('/photo', authenticate, upload.single('file'), c.uploadPhoto);
r.post('/logo',  authenticate, upload.single('file'), c.uploadLogo);
module.exports = r;
