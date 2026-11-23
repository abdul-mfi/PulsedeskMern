const r = require("express").Router();
const c = require("../controllers/deadlineChecker.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isManager } = require("../middleware/role.middleware");


r.get("/checkAndUpdateWorkStatus", authenticate, isManager, c.checkAndUpdateWorkStatus);

module.exports = r;
