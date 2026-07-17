const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, default: '', trim: true },
    message:  { type: String, required: true, trim: true },
    eventDate:{ type: String, default: '' },
    isRead:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
