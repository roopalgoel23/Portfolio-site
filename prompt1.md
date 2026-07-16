You are a senior Node.js developer. Build the complete Express + MongoDB backend for a bridal makeup artist portfolio site called "Makeup by Roopal Goel".

Stack: Node.js, Express, Mongoose, Multer, JWT, bcryptjs, Nodemailer, CORS, dotenv.

Write every file completely. No placeholders.

MODELS:

SiteContent: heroKicker, heroTitle, heroSubtitle, aboutTitle, aboutBody, whatsapp, email, instagram, heroImage (string), aboutImages ([string])
Service: title, description, priceRange, icon, order
PortfolioItem: type (photo/video), category (bridal/engagement/mehendi/party), src, videoUrl, caption, order
FeaturedBride: name, occasion, image, order
Testimonial: clientName, occasion, rating (1-5), review, photo, order
FAQ: question, answer, order
ROUTES (public — no auth):
GET /api/content
GET /api/services
GET /api/portfolio?category=
GET /api/brides
GET /api/testimonials
GET /api/faqs
POST /api/contact → send email via Nodemailer

ROUTES (admin — JWT Bearer):
POST /api/admin/login
PUT /api/content
POST /api/content/hero-image (multer single)
POST /api/content/about-images (multer array max 3)
POST, PUT, DELETE /api/services/:id + POST /api/services/reorder
POST, PUT, DELETE /api/portfolio/:id + POST /api/portfolio/reorder
POST, PUT, DELETE /api/brides/:id + POST /api/brides/reorder
POST, PUT, DELETE /api/testimonials/:id
POST, PUT, DELETE /api/faqs/:id + POST /api/faqs/reorder

AUTH: Admin email + password from .env. Login returns JWT (7d). Middleware verifies Bearer token.

UPLOADS: Multer → /server/uploads/, static served. Accept jpeg/png/webp/mp4. UUID filenames.

In production: serve /client/dist as static, SPA fallback for non-/api routes.

Folder structure:
server/
server.js
.env.example
middleware/auth.js, upload.js
models/ (all 6)
controllers/ (one per resource + contact)
routes/ (one per resource + contact)

Write every file in full now.