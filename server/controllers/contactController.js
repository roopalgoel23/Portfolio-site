const nodemailer = require('nodemailer');
const Enquiry = require('../models/Enquiry');

/**
 * POST /api/contact
 * Body: { name, email, phone, message, eventDate }
 *
 * 1. Saves the enquiry to MongoDB (always — so no lead is lost)
 * 2. Attempts to send an email notification (best-effort, non-blocking)
 */
exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, phone, message, eventDate } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    // ── 1. Save to database (primary, always works) ──
    await Enquiry.create({ name, email, phone, message, eventDate });

    // ── 2. Try email notification (best-effort, never blocks the response) ──
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   Number(process.env.SMTP_PORT) || 587,
          secure: (Number(process.env.SMTP_PORT) || 587) === 465,
          connectionTimeout: 5000,
          greetingTimeout:   5000,
          socketTimeout:     5000,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const smtpUser = process.env.SMTP_USER;
        const fromName = process.env.CONTACT_FROM_NAME || 'Portfolio Enquiry';
        const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;
        const toEmail   = process.env.CONTACT_TO_EMAIL   || smtpUser;

        await transporter.sendMail({
          from:    `"${fromName}" <${fromEmail}>`,
          to:      toEmail,
          replyTo: `"${name}" <${email}>`,
          subject: `New enquiry from ${name}`,
          html: `
            <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 0;">
              <p style="font-size: 15px; color: #888; margin-bottom: 32px;">
                New enquiry from your portfolio site
              </p>
              <p style="font-size: 22px; line-height: 1.6; color: #2C2A2A; padding: 24px 40px; border-left: 4px solid #E6D2CC;">
                ${message}
              </p>
              <div style="margin-top: 48px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999; margin: 4px 0;"><strong style="color: #666;">Name:</strong> ${name}</p>
                <p style="font-size: 12px; color: #999; margin: 4px 0;"><strong style="color: #666;">Email:</strong> ${email}</p>
                <p style="font-size: 12px; color: #999; margin: 4px 0;"><strong style="color: #666;">Phone:</strong> ${phone || '—'}</p>
                <p style="font-size: 12px; color: #999; margin: 4px 0;"><strong style="color: #666;">Event Date:</strong> ${eventDate || 'Not specified'}</p>
              </div>
            </div>
          `
        });
      } catch (emailErr) {
        // Email failed (e.g. Railway blocks SMTP ports) — enquiry is already saved in DB
        console.log('Email notification skipped:', emailErr.code || emailErr.message);
      }
    }

    res.json({ message: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error('Contact form error:', err.message);
    next(err);
  }
};

/**
 * GET /api/enquiries
 * Admin: list all enquiries (newest first)
 */
exports.getEnquiries = async (_req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(100);
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/enquiries/:id/read
 * Admin: mark enquiry as read
 */
exports.markEnquiryRead = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json(enquiry);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/enquiries/:id
 * Admin: delete an enquiry
 */
exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ message: 'Enquiry deleted.' });
  } catch (err) {
    next(err);
  }
};
