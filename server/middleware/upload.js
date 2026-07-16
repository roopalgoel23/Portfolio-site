const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure directory exists at module load
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ── Storage: UUID filenames, preserve original extension ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

/* ── File filter: images + videos ─────────────────────── */
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|mp4|webm|mov|avi|mkv/;
  const matchExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const matchMime = allowed.test(file.mimetype);

  if (matchExt || matchMime) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV) are allowed.'));
  }
};

/* ── Pre-configured upload instances ─────────────────── */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB per file
});

// Single image upload
const uploadSingleImage = upload.single('image');

// Multiple images (max 3)
const uploadMultipleImages = upload.array('images', 3);

// Single file (image or video)
const uploadSingleFile = upload.single('file');

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleFile
};
