const { body } = require("express-validator");
const { ROLES } = require("../../utils/constants");

const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Email must be valid"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage("Invalid role"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
];

module.exports = {
  updateUserValidation,
};
