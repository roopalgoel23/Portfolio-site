const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    priceRange:  { type: String, default: '', trim: true },
    icon:        { type: String, default: '', trim: true },
    order:       { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
