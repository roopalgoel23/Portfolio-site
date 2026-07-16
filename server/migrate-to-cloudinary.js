/**
 * migrate-to-cloudinary.js
 *
 * Uploads all locally-stored media files to Cloudinary and updates
 * MongoDB documents to reference the new Cloudinary URLs.
 *
 * Local files in server/uploads/ are NOT deleted.
 *
 * Models updated:
 *  - SiteContent:     heroImage, aboutImages[]
 *  - PortfolioItem:   src, videoUrl
 *  - FeaturedBride:   image, gallery[].src, gallery[].videoUrl
 *  - Testimonial:     photo
 *
 * Usage:
 *   cd server
 *   node migrate-to-cloudinary.js
 */

require('dotenv').config();

const path       = require('path');
const fs         = require('fs');
const mongoose   = require('mongoose');
const cloudinary = require('./config/cloudinary');
const streamifier = require('streamifier');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// ── Models ──
const SiteContent   = require('./models/SiteContent');
const PortfolioItem = require('./models/PortfolioItem');
const FeaturedBride = require('./models/FeaturedBride');
const Testimonial   = require('./models/Testimonial');

/* ── Helpers ─────────────────────────────────────────── */

/**
 * Check if a string is a local /uploads/ path
 */
function isLocalPath(str) {
  return str && typeof str === 'string' && str.startsWith('/uploads/');
}

/**
 * Extract the filename from a /uploads/filename.ext path
 */
function getFilename(localPath) {
  return localPath.replace('/uploads/', '').split('?')[0];
}

/**
 * Determine if a file is a video based on extension
 */
function isVideo(filename) {
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(filename);
}

/**
 * Upload a local file to Cloudinary
 */
async function uploadLocalFile(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  File not found: ${filename}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const resourceType = isVideo(filename) ? 'video' : 'image';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio/migrated',
        resource_type: resourceType,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

/* ── Migration Tasks ─────────────────────────────────── */

async function migrateSiteContent() {
  console.log('\n📋 Migrating SiteContent...');
  const content = await SiteContent.findOne();
  if (!content) {
    console.log('  No SiteContent document found.');
    return;
  }

  let updated = false;

  // heroImage
  if (isLocalPath(content.heroImage)) {
    const filename = getFilename(content.heroImage);
    console.log(`  heroImage: ${filename}`);
    const url = await uploadLocalFile(filename);
    if (url) {
      content.heroImage = url;
      updated = true;
      console.log(`  ✅ → ${url}`);
    }
  }

  // aboutImages
  if (Array.isArray(content.aboutImages) && content.aboutImages.length > 0) {
    const newImages = [];
    for (const img of content.aboutImages) {
      if (isLocalPath(img)) {
        const filename = getFilename(img);
        console.log(`  aboutImage: ${filename}`);
        const url = await uploadLocalFile(filename);
        if (url) {
          newImages.push(url);
          console.log(`  ✅ → ${url}`);
        } else {
          newImages.push(img); // keep original if upload failed
        }
      } else {
        newImages.push(img);
      }
    }
    if (JSON.stringify(newImages) !== JSON.stringify(content.aboutImages)) {
      content.aboutImages = newImages;
      updated = true;
    }
  }

  if (updated) {
    await content.save();
    console.log('  💾 SiteContent saved.');
  } else {
    console.log('  No local paths to migrate.');
  }
}

async function migratePortfolioItems() {
  console.log('\n🖼️  Migrating PortfolioItems...');
  const items = await PortfolioItem.find({});
  if (items.length === 0) {
    console.log('  No PortfolioItems found.');
    return;
  }

  let count = 0;
  for (const item of items) {
    let updated = false;

    if (isLocalPath(item.src)) {
      const filename = getFilename(item.src);
      console.log(`  [${item._id}] src: ${filename}`);
      const url = await uploadLocalFile(filename);
      if (url) {
        item.src = url;
        updated = true;
        console.log(`  ✅ → ${url}`);
      }
    }

    if (isLocalPath(item.videoUrl)) {
      const filename = getFilename(item.videoUrl);
      console.log(`  [${item._id}] videoUrl: ${filename}`);
      const url = await uploadLocalFile(filename);
      if (url) {
        item.videoUrl = url;
        updated = true;
        console.log(`  ✅ → ${url}`);
      }
    }

    if (updated) {
      await item.save();
      count++;
    }
  }
  console.log(`  💾 ${count} PortfolioItems updated.`);
}

async function migrateFeaturedBrides() {
  console.log('\n💐 Migrating FeaturedBrides...');
  const brides = await FeaturedBride.find({});
  if (brides.length === 0) {
    console.log('  No FeaturedBrides found.');
    return;
  }

  let count = 0;
  for (const bride of brides) {
    let updated = false;

    // image
    if (isLocalPath(bride.image)) {
      const filename = getFilename(bride.image);
      console.log(`  [${bride.name}] image: ${filename}`);
      const url = await uploadLocalFile(filename);
      if (url) {
        bride.image = url;
        updated = true;
        console.log(`  ✅ → ${url}`);
      }
    }

    // gallery items
    if (Array.isArray(bride.gallery) && bride.gallery.length > 0) {
      for (const g of bride.gallery) {
        if (isLocalPath(g.src)) {
          const filename = getFilename(g.src);
          console.log(`  [${bride.name}] gallery src: ${filename}`);
          const url = await uploadLocalFile(filename);
          if (url) {
            g.src = url;
            updated = true;
            console.log(`  ✅ → ${url}`);
          }
        }
        if (isLocalPath(g.videoUrl)) {
          const filename = getFilename(g.videoUrl);
          console.log(`  [${bride.name}] gallery videoUrl: ${filename}`);
          const url = await uploadLocalFile(filename);
          if (url) {
            g.videoUrl = url;
            updated = true;
            console.log(`  ✅ → ${url}`);
          }
        }
      }
    }

    if (updated) {
      await bride.save();
      count++;
    }
  }
  console.log(`  💾 ${count} FeaturedBrides updated.`);
}

async function migrateTestimonials() {
  console.log('\n⭐ Migrating Testimonials...');
  const testimonials = await Testimonial.find({});
  if (testimonials.length === 0) {
    console.log('  No Testimonials found.');
    return;
  }

  let count = 0;
  for (const t of testimonials) {
    if (isLocalPath(t.photo)) {
      const filename = getFilename(t.photo);
      console.log(`  [${t.clientName}] photo: ${filename}`);
      const url = await uploadLocalFile(filename);
      if (url) {
        t.photo = url;
        await t.save();
        count++;
        console.log(`  ✅ → ${url}`);
      }
    }
  }
  console.log(`  💾 ${count} Testimonials updated.`);
}

/* ── Main ────────────────────────────────────────────── */

async function main() {
  console.log('🚀 Cloudinary Migration Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME || '(not set)'}`);
  console.log(`Uploads dir: ${UPLOAD_DIR}`);

  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('⚠️  No uploads directory found. Nothing to migrate.');
    process.exit(0);
  }

  const files = fs.readdirSync(UPLOAD_DIR).filter(f => !f.startsWith('.'));
  console.log(`Local files: ${files.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  // Run migrations
  await migrateSiteContent();
  await migratePortfolioItems();
  await migrateFeaturedBrides();
  await migrateTestimonials();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Migration complete!');
  console.log('   Local files in uploads/ were NOT deleted.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
