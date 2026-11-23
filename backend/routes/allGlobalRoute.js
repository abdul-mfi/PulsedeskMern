const r = require("express").Router();

r.use("/api/auth", require("./auth.routes"));
r.use("/api/users", require("./user.routes"));
r.use("/api/clients", require("./client.routes"));
r.use("/api/departments", require("./department.routes"));
r.use("/api/jobs", require("./job.routes"));
r.use("/api/daily-logs", require("./dailyLog.routes"));
r.use("/api/reports", require("./report.routes"));
r.use("/api/hr", require("./hr.routes"));
r.use("/api/notifications", require("./notification.routes"));
r.use("/api/workspace", require("./workspace.routes"));
r.use("/api/upload", require("./upload.routes"));
r.use("/api/deadline-checker", require("./deadlineChecker.routes"));

module.exports = r;
