const express = require("express");
const { register, login, getProfile, verifyCurrentPassword, updateProfile, deleteAccount, deactivateAccount, googleLogin } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validateRequest");
const verifyToken = require("../middleware/verifyToken");
const {
  registerValidation,
  loginValidation,
  googleLoginValidation,
} = require("../middleware/validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/google", googleLoginValidation, validateRequest, googleLogin);

// Authenticated user profile management
router.get("/profile", verifyToken, getProfile);
router.post("/verify-password", verifyToken, verifyCurrentPassword);
router.put("/profile", verifyToken, updateProfile);
router.post("/deactivate", verifyToken, deactivateAccount);
router.delete("/account", verifyToken, deleteAccount);

module.exports = router;
