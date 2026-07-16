/**
 * Seed script — run once to populate the MongoDB database.
 *
 * Usage:
 *   cd server
 *   npm install
 *   node seed.js
 */
require('dotenv').config();

const mongoose       = require('mongoose');
const SiteContent    = require('./models/SiteContent');
const Service        = require('./models/Service');
const PortfolioItem  = require('./models/PortfolioItem');
const FeaturedBride  = require('./models/FeaturedBride');
const Testimonial    = require('./models/Testimonial');
const FAQ            = require('./models/FAQ');

/* ── Data ────────────────────────────────────────────── */

const siteContent = {
  heroKicker:   'Bridal Makeup Artist',
  heroTitle:    'Makeup by Roopal Goel',
  heroSubtitle: 'Enhancing your natural beauty on your most special day.',
  aboutTitle:   'About Roopal',
  aboutBody:
    'Roopal Goel is a professional bridal makeup artist with years of experience ' +
    'creating flawless, long-lasting looks for brides, engagement parties, mehendi ' +
    'ceremonies, and special occasions. She believes in enhancing each client\'s ' +
    'natural features to make them feel confident and radiant.',
  whatsapp:  '+91-9876543210',
  email:     'Makeupbyroopalgoel@gmail.com',
  instagram: 'https://www.instagram.com/makeupbyroopalgoel',
  heroImage:   '',
  aboutImages: []
};

const services = [
  { title: 'Bridal Makeup',       description: 'Complete bridal look including HD makeup, hair styling, and draping.', priceRange: '₹15,000 - ₹35,000', icon: '👰', order: 0 },
  { title: 'Engagement Makeup',   description: 'Elegant makeup for your engagement ceremony.',                          priceRange: '₹8,000 - ₹15,000',  icon: '💍', order: 1 },
  { title: 'Mehendi Makeup',      description: 'Fresh and glowing look for your mehendi function.',                     priceRange: '₹6,000 - ₹12,000',  icon: '🌿', order: 2 },
  { title: 'Party Makeup',        description: 'Glamorous party and event makeup.',                                     priceRange: '₹4,000 - ₹8,000',   icon: '🎉', order: 3 },
  { title: 'Pre-Wedding Shoot',   description: 'Camera-ready makeup for pre-wedding photoshoots.',                      priceRange: '₹5,000 - ₹10,000',  icon: '📷', order: 4 },
  { title: 'Trial Makeup',        description: 'Book a trial session before your big day.',                             priceRange: '₹2,000 - ₹3,000',   icon: '✨', order: 5 }
];

const portfolioItems = [
  { type: 'photo', category: 'bridal',     src: '', caption: 'Traditional bridal look',     order: 0 },
  { type: 'photo', category: 'bridal',     src: '', caption: 'Reception bridal glow',        order: 1 },
  { type: 'photo', category: 'engagement', src: '', caption: 'Soft glam engagement',         order: 2 },
  { type: 'photo', category: 'mehendi',    src: '', caption: 'Fresh mehendi morning look',   order: 3 },
  { type: 'photo', category: 'party',      src: '', caption: 'Bold party glam',              order: 4 },
  { type: 'video', category: 'bridal',     src: '', videoUrl: '', caption: 'Bridal makeup reel', order: 5 }
];

const featuredBrides = [
  { name: 'Priya Sharma',    occasion: 'Wedding',     image: '', order: 0 },
  { name: 'Anjali Verma',    occasion: 'Engagement',  image: '', order: 1 },
  { name: 'Neha Gupta',      occasion: 'Reception',   image: '', order: 2 },
  { name: 'Riya Malhotra',   occasion: 'Mehendi',     image: '', order: 3 }
];

const testimonials = [
  {
    clientName: 'Priya Sharma',
    occasion:   'Wedding',
    rating:     5,
    review:     'Roopal made me feel like the most beautiful bride. The makeup lasted the entire day and looked amazing in every photo!',
    photo:      '',
    order:      0
  },
  {
    clientName: 'Anjali Verma',
    occasion:   'Engagement',
    rating:     5,
    review:     'Absolutely loved my engagement look. She understood exactly what I wanted and delivered beyond expectations.',
    photo:      '',
    order:      1
  },
  {
    clientName: 'Neha Gupta',
    occasion:   'Reception',
    rating:     5,
    review:     'Professional, punctual and incredibly talented. Highly recommend for any special occasion!',
    photo:      '',
    order:      2
  }
];

const faqs = [
  { question: 'How far in advance should I book?',                          answer: 'We recommend booking at least 2-3 months in advance, especially during wedding season (October-February).', order: 0 },
  { question: 'Do you offer a trial session?',                              answer: 'Yes! We offer trial sessions so you can experience the look before your big day. Contact us to schedule one.', order: 1 },
  { question: 'What products do you use?',                                  answer: 'We use high-quality, skin-friendly products from premium brands like MAC, Huda Beauty, and NARS.',        order: 2 },
  { question: 'Do you travel for destination weddings?',                   answer: 'Yes, we travel for destination weddings. Travel and accommodation charges may apply.',                       order: 3 },
  { question: 'Is hair styling included in the package?',                  answer: 'Hair styling and draping can be included in bridal packages. Please contact us for detailed pricing.',     order: 4 },
  { question: 'What is the payment and cancellation policy?',              answer: 'A 50% advance is required to confirm the booking. Cancellations made 30+ days in advance receive a full refund of the advance.', order: 5 }
];

/* ── Seed logic ──────────────────────────────────────── */

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await Promise.all([
    SiteContent.deleteMany({}),
    Service.deleteMany({}),
    PortfolioItem.deleteMany({}),
    FeaturedBride.deleteMany({}),
    Testimonial.deleteMany({}),
    FAQ.deleteMany({})
  ]);
  console.log('✅ Cleared\n');

  // Insert site content
  console.log('Creating SiteContent...');
  await SiteContent.create(siteContent);
  console.log('✅ SiteContent created');

  // Insert services
  console.log('Creating Services...');
  await Service.insertMany(services);
  console.log(`✅ ${services.length} Services created`);

  // Insert portfolio items
  console.log('Creating PortfolioItems...');
  await PortfolioItem.insertMany(portfolioItems);
  console.log(`✅ ${portfolioItems.length} PortfolioItems created`);

  // Insert featured brides
  console.log('Creating Featured Brides...');
  await FeaturedBride.insertMany(featuredBrides);
  console.log(`✅ ${featuredBrides.length} Featured Brides created`);

  // Insert testimonials
  console.log('Creating Testimonials...');
  await Testimonial.insertMany(testimonials);
  console.log(`✅ ${testimonials.length} Testimonials created`);

  // Insert FAQs
  console.log('Creating FAQs...');
  await FAQ.insertMany(faqs);
  console.log(`✅ ${faqs.length} FAQs created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nCollections created:');
  console.log('  • sitecontents');
  console.log('  • services');
  console.log('  • portfolioitems');
  console.log('  • featuredbrides');
  console.log('  • testimonials');
  console.log('  • faqs');

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
