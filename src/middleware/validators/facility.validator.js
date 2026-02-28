const { body } = require("express-validator");

const createFacilityValidation = [
  body("name").trim().notEmpty().withMessage("Facility name is required"),
  body("type")
    .isIn(["toilet", "well", "water_tank"])
    .withMessage("Invalid facility type"),
  body("villageId").isMongoId().withMessage("Valid villageId is required"),
  body("condition")
    .optional()
    .isIn(["good", "moderate", "critical"])
    .withMessage("Invalid condition"),
  body("lastInspection")
    .optional()
    .isISO8601()
    .withMessage("lastInspection must be a valid date"),
];

const updateFacilityValidation = [
  body("name").optional().trim().notEmpty(),
  body("type").optional().isIn(["toilet", "well", "water_tank"]),
  body("villageId").optional().isMongoId(),
  body("condition").optional().isIn(["good", "moderate", "critical"]),
  body("lastInspection").optional().isISO8601(),
];

module.exports = {
  createFacilityValidation,
  updateFacilityValidation,
};
