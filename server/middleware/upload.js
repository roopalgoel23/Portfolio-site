const multer      = require('multer');
const path        = require('path');
const streamifier = require('streamifier');

/* ── Cloudinary free-plan size limits ─────────────────── */
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;    //  10 MB (Cloudinary max image size)
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;   // 100 MB (Cloudinary max video size)

/* ── File filter: images + videos ─────────────────────── */
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|mp4|webm|mov|avi|mkv/;
  const matchExt  = allowed.test(path.extname(file.originalname).toLowerCase());
  const matchMime = allowed.test(file.mimetype);

  if (matchExt || matchMime) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV) are allowed.'));
  }
};

/* ── Image-only multer instance (10 MB limit) ────────── */
const imageUpload = multer({
  storage:  multer.memoryStorage(),
  fileFilter,
  limits:   { fileSize: IMAGE_SIZE_LIMIT }
});

/* ── Mixed (image + video) multer instance (100 MB limit) ── */
const upload = multer({
  storage:  multer.memoryStorage(),
  fileFilter,
  limits:   { fileSize: VIDEO_SIZE_LIMIT }
});

/**
 * Post-upload validator: enforces Cloudinary's per-type limits
 * for mixed uploads where multer can't know the type beforehand.
 * Usage: uploadSingleFile, checkCloudinaryLimits, controller...
 */
function checkCloudinaryLimits(req, res, next) {
  const file = req.file;
  if (!file) return next();

  const isVideo = file.mimetype && file.mimetype.startsWith('video');
  const limit   = isVideo ? VIDEO_SIZE_LIMIT : IMAGE_SIZE_LIMIT;
  const label   = isVideo ? '100 MB' : '10 MB';

  if (file.size > limit) {
    return res.status(413).json({
      message: `File too large for Cloudinary free plan. ${isVideo ? 'Videos' : 'Images'} must be under ${label}. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`
    });
  }

  next();
}

// Single image upload (10 MB limit enforced by multer)
const uploadSingleImage = imageUpload.single('image');

// Multiple images (max 3, 10 MB each)
const uploadMultipleImages = imageUpload.array('images', 3);

// Single file (image or video)
const uploadSingleFile = upload.single('file');

/* ── Cloudinary upload helper ────────────────────────── */
const cloudinary = require('../config/cloudinary');

/**
 * Upload a single file buffer to Cloudinary.
 * @param {Object} file – multer file object
 * @param {String} folder – Cloudinary folder (default 'portfolio')
 * @param {String} resourceType – 'image' | 'video' | 'auto'
 * @returns {Promise<{url, publicId, bytes, format, resourceType, width?, height?, duration?}>}
 */
async function uploadToCloudinary(file, folder = 'portfolio', resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url:          result.secure_url,
          publicId:     result.public_id,
          bytes:        result.bytes,
          format:       result.format,
          resourceType: result.resource_type,
          width:        result.width   || null,
          height:       result.height  || null,
          duration:     result.duration || null
        });
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary by publicId.
 * @param {String} publicId
 * @param {String} resourceType – 'image' | 'video'
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = {
  upload,
  imageUpload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleFile,
  uploadToCloudinary,
  deleteFromCloudinary,
  checkCloudinaryLimits,
  IMAGE_SIZE_LIMIT,
  VIDEO_SIZE_LIMIT
};
