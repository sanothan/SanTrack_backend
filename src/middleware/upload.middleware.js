/**
 * Upload Middleware
 * Handles file uploads for images and documents
 */

const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination based on file type or upload type
    let uploadPath = 'uploads/';
    
    if (req.uploadType === 'facility-images') {
      uploadPath = 'uploads/facilities/';
    } else if (req.uploadType === 'inspection-photos') {
      uploadPath = 'uploads/inspections/';
    } else if (req.uploadType === 'issue-photos') {
      uploadPath = 'uploads/issues/';
    } else if (req.uploadType === 'user-avatar') {
      uploadPath = 'uploads/avatars/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

/**
 * Upload images middleware
 * @param {string} uploadType - Type of upload (facility-images, inspection-photos, etc.)
 * @param {string} fieldName - Field name for files (default: 'images')
 * @param {number} maxCount - Maximum number of files (default: 5)
 */
const uploadImages = (uploadType, fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    // Set upload type on request for storage configuration
    req.uploadType = uploadType;
    
    // Handle multiple file upload
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB.',
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum allowed is ${maxCount}.`,
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name for file upload.',
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed.',
        });
      }
      
      next();
    });
  };
};

/**
 * Upload single image middleware
 * @param {string} uploadType - Type of upload
 * @param {string} fieldName - Field name for file (default: 'image')
 */
const uploadSingleImage = (uploadType, fieldName = 'image') => {
  return (req, res, next) => {
    req.uploadType = uploadType;
    
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB.',
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed.',
        });
      }
      
      next();
    });
  };
};

module.exports = {
  uploadImages,
  uploadSingleImage,
};
