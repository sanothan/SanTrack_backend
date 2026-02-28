const express = require("express");
const {
  createFacility,
  getFacilities,
  getPublicFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
} = require("../controllers/facility.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const validateRequest = require("../middleware/validateRequest");
const {
  createFacilityValidation,
  updateFacilityValidation,
} = require("../middleware/validators/facility.validator");

const router = express.Router();

// Public unauthenticated route
router.get("/public", getPublicFacilities);

router.use(verifyToken);

router.post(
  "/",
  authorizeRoles("admin"),
  createFacilityValidation,
  validateRequest,
  createFacility
);
router.get("/", authorizeRoles("admin", "inspector", "community"), getFacilities);
router.get(
  "/:id",
  authorizeRoles("admin", "inspector", "community"),
  getFacilityById
);
router.put(
  "/:id",
  authorizeRoles("admin"),
  updateFacilityValidation,
  validateRequest,
  updateFacility
);
router.delete("/:id", authorizeRoles("admin"), deleteFacility);

module.exports = router;
