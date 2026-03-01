const express = require("express");
const { register, login, updateProfile, deleteAccount } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validateRequest");
const verifyToken = require("../middleware/verifyToken");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

// Authenticated user profile management
router.put("/profile", verifyToken, updateProfile);
router.delete("/account", verifyToken, deleteAccount);

module.exports = router;
