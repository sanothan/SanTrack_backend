const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const villageRoutes = require("./village.routes");
const facilityRoutes = require("./facility.routes");
const inspectionRoutes = require("./inspection.routes");
const issueRoutes = require("./issue.routes");
const dashboardRoutes = require("./dashboard.routes");
const uploadRoutes = require("./upload.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/villages", villageRoutes);
router.use("/facilities", facilityRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/issues", issueRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadRoutes);

module.exports = router;
