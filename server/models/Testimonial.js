const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    occasion:   { type: String, default: '', trim: true },
    rating:     { type: Number, min: 1, max: 5, default: 5 },
    review:     { type: String, default: '', trim: true },
    photo:      { type: String, default: '' },
    order:      { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
