const nodemailer = require('nodemailer');

/**
 * POST /api/contact
 * Body: { name, email, phone, message }
 * Sends a notification email via Nodemailer.
 */
exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, phone, message, eventDate } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (Number(process.env.SMTP_PORT) || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <p style="font-size: 15px; color: #888; margin-bottom: 32px;">
          New enquiry from your portfolio site
        </p>

        <p style="font-size: 22px; line-height: 1.6; color: #2C2A2A; padding: 24px 40px; border-left: 4px solid #E6D2CC;">
          ${message}
        </p>

        <div style="margin-top: 48px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999; margin: 4px 0;">
            <strong style="color: #666;">Name:</strong> ${name}
          </p>
          <p style="font-size: 12px; color: #999; margin: 4px 0;">
            <strong style="color: #666;">Email:</strong> ${email}
          </p>
          <p style="font-size: 12px; color: #999; margin: 4px 0;">
            <strong style="color: #666;">Phone:</strong> ${phone || '—'}
          </p>
          <p style="font-size: 12px; color: #999; margin: 4px 0;">
            <strong style="color: #666;">Event Date:</strong> ${eventDate || 'Not specified'}
          </p>
        </div>
      </div>
    `;

    const smtpUser  = process.env.SMTP_USER;
    const fromName  = process.env.CONTACT_FROM_NAME  || 'Portfolio Enquiry';
    // Use + alias so Gmail inbox shows the name instead of "me"
    const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser.replace('@', '+enquiry@');
    const toEmail   = process.env.CONTACT_TO_EMAIL   || smtpUser;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to:   toEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `New enquiry from ${name}`,
      html
    });

    res.json({ message: 'Your message has been sent successfully!' });
  } catch (err) {
    next(err);
  }
};
