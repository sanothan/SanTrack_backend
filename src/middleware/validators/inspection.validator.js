const { body } = require("express-validator");

const createInspectionValidation = [
  body("facilityId").isMongoId().withMessage("Valid facilityId is required"),
  body("score")
    .isInt({ min: 1, max: 10 })
    .withMessage("Score must be between 1 and 10"),
  body("remarks").optional().isString().withMessage("Remarks must be a string"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("images.*.url").optional().isURL().withMessage("Each image must have a valid url"),
  body("images.*.publicId").optional().isString().withMessage("Each image must have a publicId"),
  body("date").optional().isISO8601().withMessage("Date must be valid"),
];

const updateInspectionValidation = [
  body("facilityId").optional().isMongoId(),
  body("score").optional().isInt({ min: 1, max: 10 }),
  body("remarks").optional().isString(),
  body("images").optional().isArray(),
  body("images.*.url").optional().isURL(),
  body("images.*.publicId").optional().isString(),
  body("date").optional().isISO8601(),
];

module.exports = {
  createInspectionValidation,
  updateInspectionValidation,
};
