const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema(
  {
    type:     { type: String, enum: ['image', 'video'], default: 'image' },
    src:      { type: String, default: '' },
    videoUrl: { type: String, default: '' }
  },
  { _id: true }
);

const featuredBrideSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    occasion:   { type: String, default: '', trim: true },
    image:      { type: String, default: '' },
    gallery:    { type: [mediaItemSchema], default: [] },
    thumbnailId:{ type: mongoose.Schema.Types.ObjectId, default: null },
    order:      { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeaturedBride', featuredBrideSchema);
