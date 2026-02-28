const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const validateRequest = require("../middleware/validateRequest");
const { updateUserValidation } = require("../middleware/validators/user.validator");

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("admin"));

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserValidation, validateRequest, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
