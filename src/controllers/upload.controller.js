const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary } = require("../services/upload.service");

const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No image file provided. Use field name 'image'.");
    }

    let result;
    try {
        result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } catch (err) {
        throw new ApiError(502, "Failed to upload image to cloud storage. Please try again.");
    }

    res.status(201).json({
        message: "Image uploaded successfully",
        url: result.url,
        publicId: result.publicId,
    });
});

module.exports = { uploadImage };
