const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    heroKicker:   { type: String, default: '' },
    heroTitle:    { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    aboutTitle:   { type: String, default: '' },
    aboutBody:    { type: String, default: '' },
    whatsapp:     { type: String, default: '' },
    email:        { type: String, default: '' },
    instagram:    { type: String, default: '' },
    heroImage:    { type: String, default: '' },
    aboutImages:  { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
