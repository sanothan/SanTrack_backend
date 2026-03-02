const express = require("express");
const { uploadImage } = require("../controllers/upload.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Only authenticated inspector / admin users may upload images
router.post(
    "/image",
    verifyToken,
    authorizeRoles("admin", "inspector"),
    (req, res, next) => {
        upload.single("image")(req, res, (err) => {
            if (err) {
                // Multer errors (file size, type, etc.)
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(413).json({ message: "File too large. Maximum size is 5MB." });
                }
                return res.status(400).json({ message: err.message || "File upload error." });
            }
            next();
        });
    },
    uploadImage
);

module.exports = router;
