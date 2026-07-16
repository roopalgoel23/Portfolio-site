You are a senior full-stack developer. Build the complete "Makeup by Roopal Goel" portfolio website from scratch. Write every file in full — no placeholders, no "add your code here" comments, no truncation.

---

## STACK
- Frontend: React 18 + Vite, React Router v6, Axios, Tailwind CSS (custom tokens), Lucide React, Swiper.js, React Hook Form, Framer Motion
- Backend: Node.js, Express, MongoDB + Mongoose, Multer (file uploads), JWT + bcryptjs, Nodemailer, CORS, dotenv
- Monorepo: /client (React) and /server (Node) in one repo root

---

## DESIGN SYSTEM — enforce every token, no exceptions

Colors:
- Page background: #FAF5F2
- Card/section background: #F4EEE8
- Accent (icons, labels, dividers): #E6D2CC
- Hover/overlay accent: #D8C4B6
- Primary text: #2C2A2A
- Secondary text: #7A706B
- Border: 1px solid #DDD4CC

Typography:
- Headings: Playfair Display (Google Fonts), letter-spacing -0.02em, line-height 110%
- Body + UI: Inter (Google Fonts), line-height 170%
- Hero H1: 72px desktop / 56px tablet / 40px mobile, weight 600
- Section H2: 48px, weight 600
- Body: 18px, weight 400, color #7A706B
- Nav/labels: 15px Inter uppercase, letter-spacing 0.08em

Buttons:
- Primary: bg #2C2A2A, text white, radius 12px, padding 16px 32px — hover: bg #D8C4B6, text #2C2A2A, 300ms
- Secondary: transparent, 1px solid #2C2A2A, text #2C2A2A — hover: bg #2C2A2A, text white

Cards: bg #F4EEE8, border 1px #DDD4CC, radius 20px, padding 32px, shadow 0 6px 20px rgba(0,0,0,0.05)
Images: border-radius 20px, hover scale(1.05) with overflow hidden, 350ms
Icons: Lucide React, thin line, color #D8C4B6
Layout: max-width 1280px, section padding 120px desktop / 80px tablet / 60px mobile
Animations: fade-up on scroll (Intersection Observer), 60px translateY → 0, opacity 0 → 1, 350ms. Respect prefers-reduced-motion.
NO gradients, NO glassmorphism, NO heavy box shadows, NO bright colors.

---

## MONGODB MODELS

SiteContent (single document, upsert pattern):
- heroKicker, heroTitle, heroSubtitle, aboutTitle, aboutBody
- whatsapp, email, instagram
- heroImage (string path), aboutImages ([string] × 3)

Service:
- title (required), description (required), priceRange, icon (string key), order (Number)

PortfolioItem:
- type: enum ['photo','video']
- category: enum ['bridal','engagement','mehendi','party']
- src (string), videoUrl (string), caption, order

FeaturedBride:
- name (required), occasion, image (required), order

Testimonial:
- clientName (required), occasion, rating (1–5), review (required), photo, order

FAQ:
- question (required), answer (required), order

---

## API ROUTES

Public (no auth):
GET    /api/content
GET    /api/services
GET    /api/portfolio?category=
GET    /api/brides
GET    /api/testimonials
GET    /api/faqs
POST   /api/contact  → send email via Nodemailer

Admin (JWT Bearer required):
POST   /api/admin/login
PUT    /api/content
POST   /api/content/hero-image       (multer single)
POST   /api/content/about-images     (multer array, max 3)
POST/PUT/DELETE  /api/services/:id
POST   /api/services/reorder
POST/PUT/DELETE  /api/portfolio/:id
POST   /api/portfolio/reorder
POST/PUT/DELETE  /api/brides/:id
POST   /api/brides/reorder
POST/PUT/DELETE  /api/testimonials/:id
POST/PUT/DELETE  /api/faqs/:id
POST   /api/faqs/reorder

Auth: Admin email + password stored in env vars. On login, return signed JWT (7d expiry). Auth middleware verifies Bearer token on all /api/admin/* and protected mutation routes.

File uploads: Multer, store to /server/uploads/, serve as static. Accept jpeg/png/webp/mp4, max 10MB images / 100MB video. Generate unique filenames (uuid + original extension).

---

## FRONTEND — PUBLIC SITE

Pages:
- / → Home (all sections)
- /admin/* → Admin panel (lazy loaded, JWT protected)

Navbar:
- Transparent → sticky with #FAF5F2 bg after 80px scroll
- Logo left (Playfair Display italic "Roopal Goel" + "HAIR & MAKEUP ARTIST" subtitle in Inter 10px uppercase)
- Links right: HOME ABOUT SERVICES PORTFOLIO REVIEWS CONTACT
- "BOOK NOW" primary button
- Mobile: hamburger → full-screen slide-down menu

Home sections (fetch all data from API on mount, show skeleton loaders):

1. HeroSection
   - Left 50%: kicker label (Inter uppercase #E6D2CC), H1 (Playfair Display), subtitle (Inter 18px #7A706B), two CTA buttons ("BOOK YOUR DATE" primary, "VIEW PORTFOLIO" secondary)
   - Right 50%: hero image, radius 20px, subtle zoom on load
   - Full viewport height, bg #FAF5F2
   - Fade-in on load

2. TrustBar
   - 4-column grid: Diamond icon (Luxury Products), Clock (Long Lasting), Camera (HD & Camera Ready), Heart (Personalized Experience)
   - Icon #D8C4B6, label Inter 13px uppercase bold, description Inter 14px #7A706B
   - bg #F4EEE8, no border

3. AboutSection
   - Left: "ABOUT ME" kicker, H2, body text, "KNOW MORE" secondary button
   - Right: 3 portrait images in staggered grid (2 top row, 1 bottom spanning or offset)
   - bg #F4EEE8

4. ServicesSection
   - "SIGNATURE SERVICES" kicker + H2
   - 3-column card grid (1 col mobile, 2 col tablet, 3 col desktop)
   - Each card: thin icon, title, description, price range badge, "Book This" link
   - Hover: card lifts 4px, border #D8C4B6

5. FeaturedBridesSection
   - "FEATURED BRIDES" kicker + H2
   - Swiper.js horizontal scroll, autoplay 3s, loop
   - Each slide: full image, gradient overlay at bottom, bride name + occasion text
   - Custom prev/next arrows in #2C2A2A

6. PortfolioSection
   - "PORTFOLIO" kicker + H2
   - Filter tabs: ALL / BRIDAL / ENGAGEMENT / MEHENDI / PARTY (Inter 13px uppercase, active tab underline #E6D2CC)
   - CSS masonry grid (columns: 3 desktop, 2 tablet, 1 mobile)
   - Photo items: image + hover overlay with subtle zoom
   - Video items: thumbnail + centered play button circle → open lightbox modal with embedded player
   - Fade filter transition 300ms

7. TestimonialsSection
   - "CLIENT LOVE" kicker + H2 centered
   - Swiper, 1 card visible, center mode with peek of adjacent cards
   - Card: star rating (★ ★ ★ ★ ★ in #E6D2CC), review text (Playfair Display italic), client name + occasion (Inter)
   - bg #FAF5F2

8. FAQSection
   - "FAQ" kicker + H2 centered, max-width 780px
   - Accordion: each row has question + +/- icon, smooth height animation, answer text below
   - Border bottom 1px #DDD4CC between items

9. ContactSection
   - "GET IN TOUCH" kicker + H2
   - Left column: WhatsApp CTA button (green #25D366), email link, Instagram link
   - Right column: form with name, phone, wedding date (date input), message (textarea)
   - React Hook Form validation
   - On submit: POST /api/contact → toast success or error

10. Footer
    - Logo, nav links in a row, social icons (Instagram, WhatsApp)
    - Contact details: phone, email
    - Copyright line
    - bg #FAF5F2, border-top 1px #DDD4CC

WhatsApp floating button: fixed bottom-right, visible on all pages, mobile priority.

---

## ADMIN PANEL

Route: /admin (protected by AuthContext + PrivateRoute)
/admin/login → login page
/admin → redirects to /admin/content

Admin Layout:
- Left sidebar (fixed, 240px): logo + "Admin" label, nav links to each section, "View Site ↗" external link, "Sign Out" at bottom
- Top bar: "Roopal Goel · Admin" (Playfair Display) left, "View Site ↗" + "Sign Out" right (matches screenshot style)
- Right content area: scrollable

Admin Pages:

/admin/content — Site Content
- Form matching the reference screenshot exactly:
  - Two-column row: HERO KICKER (text input) | INSTAGRAM HANDLE (text input)
  - Full-width: HERO TITLE (text input)
  - Full-width: HERO SUBTITLE (textarea)
  - Full-width: ABOUT TITLE (text input)
  - Full-width: ABOUT BODY (textarea)
  - Two-column row: WHATSAPP NUMBER | CONTACT EMAIL
  - Image upload section: hero image preview + replace button, 3 about images
  - Field labels: Inter 12px uppercase letter-spacing 0.08em color #7A706B
  - Inputs: white bg, border 1px #DDD4CC, radius 12px, padding 12px 16px, focus border #D8C4B6
  - "Save Changes" primary button

/admin/services — Services
- List of service cards with Edit / Delete buttons
- "Add Service" button → inline expand form
- Fields: title, description, price range, icon (text key)
- Up/down reorder arrows

/admin/portfolio — Portfolio
- Tabs: Photos | Videos
- Photo: drag-drop upload zone, category dropdown, caption input
- Video: URL input (YouTube/Vimeo) or file upload, category, caption
- Grid of existing items with category badge + delete button

/admin/brides — Featured Brides
- Upload zone + name + occasion fields
- Grid preview with delete + reorder

/admin/testimonials — Reviews
- List with add / edit (inline expand) / delete
- Fields: name, occasion, star rating (clickable stars), review text

/admin/faqs — FAQs
- Add/edit/delete with inline expand
- Reorder with up/down arrows

Global admin:
- All mutations use react-hot-toast for feedback
- Delete actions show a confirmation modal before proceeding
- File upload shows progress bar
- 401 response → clear token → redirect to /admin/login

---

## PROJECT STRUCTURE

/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── context/AuthContext.jsx
│       ├── hooks/useFetch.js
│       ├── api/axios.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── PrivateRoute.jsx
│       │   ├── sections/
│       │   │   ├── HeroSection.jsx
│       │   │   ├── TrustBar.jsx
│       │   │   ├── AboutSection.jsx
│       │   │   ├── ServicesSection.jsx
│       │   │   ├── FeaturedBridesSection.jsx
│       │   │   ├── PortfolioSection.jsx
│       │   │   ├── TestimonialsSection.jsx
│       │   │   ├── FAQSection.jsx
│       │   │   └── ContactSection.jsx
│       │   └── admin/
│       │       ├── AdminLayout.jsx
│       │       ├── AdminSidebar.jsx
│       │       └── pages/
│       │           ├── AdminLogin.jsx
│       │           ├── AdminContent.jsx
│       │           ├── AdminServices.jsx
│       │           ├── AdminPortfolio.jsx
│       │           ├── AdminBrides.jsx
│       │           ├── AdminTestimonials.jsx
│       │           └── AdminFAQs.jsx
│       └── pages/
│           └── Home.jsx
└── server/
    ├── server.js
    ├── .env.example
    ├── middleware/
    │   ├── auth.js
    │   └── upload.js
    ├── models/
    │   ├── SiteContent.js
    │   ├── Service.js
    │   ├── PortfolioItem.js
    │   ├── FeaturedBride.js
    │   ├── Testimonial.js
    │   └── FAQ.js
    ├── controllers/
    │   ├── contentController.js
    │   ├── serviceController.js
    │   ├── portfolioController.js
    │   ├── brideController.js
    │   ├── testimonialController.js
    │   ├── faqController.js
    │   └── contactController.js
    └── routes/
        ├── content.js
        ├── services.js
        ├── portfolio.js
        ├── brides.js
        ├── testimonials.js
        ├── faqs.js
        └── contact.js

---

## .env.example (server)
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@roopalgoel.com
ADMIN_PASSWORD=your_secure_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173

## .env (client)
VITE_API_URL=http://localhost:5000

---

## PRODUCTION BUILD
- In production, Express serves /client/dist as static files
- All non-/api routes return index.html (SPA fallback)
- Add a root package.json with scripts:
  - "dev": run both server and client concurrently
  - "build": cd client && npm run build
  - "start": node server/server.js

---

Now write every file completely. Start with the server, then the client. Do not skip any file. Do not write "// TODO" or "// add your logic here". Every function must be fully implemented.