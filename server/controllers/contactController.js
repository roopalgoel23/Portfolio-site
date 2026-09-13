const nodemailer = require('nodemailer');
const Enquiry = require('../models/Enquiry');

// Constructed lazily (only when creds exist) so a missing/incomplete SMTP
// setup can't crash the server -- it just skips the best-effort email step.
// Short timeouts: if the host blocks outbound SMTP, this fails in ~8s
// instead of hanging for minutes (Nodemailer's default is 2 minutes).
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000
  });
}

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

    // ── 2. Try email notification via Gmail SMTP (best-effort, never blocks the response) ──
    if (transporter) {
      try {
        const fromName  = process.env.CONTACT_FROM_NAME  || 'Portfolio Enquiry';
        const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;
        const toEmail   = process.env.CONTACT_TO_EMAIL   || process.env.SMTP_USER;

        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: toEmail,
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
        // Email failed — enquiry is already saved in DB
        console.log('Email notification skipped:', emailErr.message);
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
