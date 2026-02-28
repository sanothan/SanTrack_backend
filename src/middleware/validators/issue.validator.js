const { body, query } = require("express-validator");

const createIssueValidation = [
  body("facilityId").isMongoId().withMessage("Valid facilityId is required"),
  body("inspectionId").optional().isMongoId(),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Issue description is required"),
  body("reporterName").optional().isString(),
  body("reporterContact").optional().isString(),
];

const updateIssueValidation = [
  body("description").optional().trim().notEmpty(),
  body("status").optional().isIn(["pending", "in_progress", "resolved"]),
  body("assignedTo").optional(),
  body("facilityId").optional().isMongoId(),
  body("inspectionId").optional().isMongoId(),
];

const issueQueryValidation = [
  query("status")
    .optional()
    .isIn(["pending", "in_progress", "resolved"])
    .withMessage("Invalid status filter"),
];

module.exports = {
  createIssueValidation,
  updateIssueValidation,
  issueQueryValidation,
};
