const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: true
    },
    category: {
      type: String,
      enum: ['bridal', 'engagement', 'mehendi', 'party', 'editorial', 'pre-wedding'],
      required: true
    },
    src:      { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    caption:  { type: String, default: '', trim: true },
    order:    { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
