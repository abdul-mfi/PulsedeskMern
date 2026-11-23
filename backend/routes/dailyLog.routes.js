const r = require("express").Router();
const c = require("../controllers/dailyLog.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { isManager } = require("../middleware/role.middleware");
r.post("/checkin", authenticate, c.checkin);
r.post("/checkout", authenticate, c.checkout);
r.get("/", authenticate, c.getLogs);
r.get("/today-summary", authenticate, isManager, c.todaySummary);
r.get("/week-heatmap", authenticate, isManager, c.weekHeatmap);
r.get("/:id/tasks", authenticate, c.getTaskLogs); // ← THIS IS MISSING — ADD IT
r.get("/my-today", authenticate, c.getMyToday); //! added by me ← THIS IS MISSING — ADD IT
module.exports = r;
