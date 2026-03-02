const cloudinary = require("../config/cloudinary");

/**
 * Uploads a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} mimetype - e.g. "image/jpeg"
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "sanitation/inspections",
                resource_type: "image",
                format: mimetype.split("/")[1], // jpeg, png, webp
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        uploadStream.end(buffer);
    });
};

module.exports = { uploadToCloudinary };
