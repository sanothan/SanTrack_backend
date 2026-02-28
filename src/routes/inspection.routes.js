const express = require("express");
const {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
} = require("../controllers/inspection.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const validateRequest = require("../middleware/validateRequest");
const {
  createInspectionValidation,
  updateInspectionValidation,
} = require("../middleware/validators/inspection.validator");

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  authorizeRoles("inspector"),
  createInspectionValidation,
  validateRequest,
  createInspection
);
router.get("/", authorizeRoles("admin", "inspector", "community"), getInspections);
router.get(
  "/:id",
  authorizeRoles("admin", "inspector", "community"),
  getInspectionById
);
router.put(
  "/:id",
  authorizeRoles("inspector"),
  updateInspectionValidation,
  validateRequest,
  updateInspection
);
router.delete("/:id", authorizeRoles("admin"), deleteInspection);

module.exports = router;
