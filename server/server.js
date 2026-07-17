require('dotenv').config();

const express          = require('express');
const mongoose         = require('mongoose');
const cors             = require('cors');
const path             = require('path');
const fs               = require('fs');
const helmet           = require('helmet');
const rateLimit        = require('express-rate-limit');
const mongoSanitize    = require('express-mongo-sanitize');

const contentRoutes       = require('./routes/contentRoutes');
const serviceRoutes       = require('./routes/serviceRoutes');
const portfolioRoutes     = require('./routes/portfolioRoutes');
const brideRoutes         = require('./routes/brideRoutes');
const testimonialRoutes   = require('./routes/testimonialRoutes');
const faqRoutes           = require('./routes/faqRoutes');
const contactRoutes       = require('./routes/contactRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const storageRoutes       = require('./routes/storageRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── MongoDB ─────────────────────────────────────────── */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ── Ensure uploads directory exists ─────────────────── */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ── Global middleware ───────────────────────────────── */

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from /uploads
  contentSecurityPolicy: false // CSP handled by Nginx in production
}));

// CORS — allow all origins (preview mode)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL injection prevention — strips $ and . from req.body/params/query
app.use(mongoSanitize());

// Global rate limiter — 100 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

/* ── Static: uploaded files ──────────────────────────── */
app.use('/uploads', express.static(uploadsDir));

/* ── API Routes ──────────────────────────────────────── */
app.use('/api', contentRoutes);
app.use('/api', serviceRoutes);
app.use('/api', portfolioRoutes);
app.use('/api', brideRoutes);
app.use('/api', testimonialRoutes);
app.use('/api', faqRoutes);
app.use('/api', contactRoutes);
app.use('/api', adminRoutes);
app.use('/api', storageRoutes);

/* ── Production: serve React SPA (if client/dist exists) ── */
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

/* ── Health check ────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── 404 & Error handlers ────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value not allowed.' });
  }

  // Mongoose cast error (bad ObjectId, etc.) → 400
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Multer file upload errors → 400
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 100MB allowed.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

/* ── Start ───────────────────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀  Server running on port ${PORT}`);
});
