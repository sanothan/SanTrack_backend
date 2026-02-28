const express = require("express");
const { getDashboardStats } = require("../controllers/dashboard.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.use(verifyToken);
router.get("/stats", authorizeRoles("admin"), getDashboardStats);

module.exports = router;
