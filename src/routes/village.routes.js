const express = require("express");
const {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
} = require("../controllers/village.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const validateRequest = require("../middleware/validateRequest");
const {
  createVillageValidation,
  updateVillageValidation,
} = require("../middleware/validators/village.validator");

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  authorizeRoles("admin"),
  createVillageValidation,
  validateRequest,
  createVillage
);
router.get("/", authorizeRoles("admin", "inspector", "community"), getVillages);
router.get(
  "/:id",
  authorizeRoles("admin", "inspector", "community"),
  getVillageById
);
router.put(
  "/:id",
  authorizeRoles("admin"),
  updateVillageValidation,
  validateRequest,
  updateVillage
);
router.delete("/:id", authorizeRoles("admin"), deleteVillage);

module.exports = router;
