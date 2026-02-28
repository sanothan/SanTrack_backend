const { body } = require("express-validator");

const createVillageValidation = [
  body("name").trim().notEmpty().withMessage("Village name is required"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("gps.lat").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
  body("gps.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("population")
    .isInt({ min: 0 })
    .withMessage("Population must be a non-negative integer"),
];

const updateVillageValidation = [
  body("name").optional().trim().notEmpty(),
  body("district").optional().trim().notEmpty(),
  body("gps.lat").optional().isFloat({ min: -90, max: 90 }),
  body("gps.lng").optional().isFloat({ min: -180, max: 180 }),
  body("population").optional().isInt({ min: 0 }),
];

module.exports = {
  createVillageValidation,
  updateVillageValidation,
};
