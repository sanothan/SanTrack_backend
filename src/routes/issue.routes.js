const express = require("express");
const {
  createIssue,
  createPublicIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} = require("../controllers/issue.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const validateRequest = require("../middleware/validateRequest");
const {
  createIssueValidation,
  updateIssueValidation,
  issueQueryValidation,
} = require("../middleware/validators/issue.validator");

const router = express.Router();

// Note: Public route deprecated in favor of authenticated reporter route
// router.post(
//   "/public",
//   createIssueValidation,
//   validateRequest,
//   createPublicIssue
// );

router.use(verifyToken);

router.post(
  "/",
  authorizeRoles("inspector", "community"),
  createIssueValidation,
  validateRequest,
  createIssue
);
router.get(
  "/",
  authorizeRoles("admin", "inspector", "community"),
  issueQueryValidation,
  validateRequest,
  getIssues
);
router.get("/:id", authorizeRoles("admin", "inspector", "community"), getIssueById);
router.put(
  "/:id",
  authorizeRoles("admin"),
  updateIssueValidation,
  validateRequest,
  updateIssue
);
router.delete("/:id", authorizeRoles("admin"), deleteIssue);

module.exports = router;
