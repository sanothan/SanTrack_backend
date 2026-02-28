const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

module.exports = router;
