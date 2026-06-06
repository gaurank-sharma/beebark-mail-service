const nodemailer = require('nodemailer');

// Reuse one transporter across warm invocations
// Accept both SMTP_* (the names already configured here) and EMAIL_* as fallback
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtpout.secureserver.net';
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
const MAIL_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"BeeBark" <${SMTP_USER}>` : 'BeeBark <info@thebeebark.com>');

let transporter;
const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // SSL on 465, STARTTLS otherwise
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 12000
  });
  return transporter;
};

/**
 * POST /api/send
 * Headers: x-mail-secret: <MAIL_SHARED_SECRET>
 * Body: { to, subject, html, text? }
 *
 * A thin, authenticated SMTP relay. Deployed on Vercel (whose network allows
 * outbound SMTP) so backends on hosts that block SMTP (e.g. Render free tier)
 * can still send mail by calling this over HTTPS.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TEMPORARY: auth gate disabled ("hardcoded open") to unblock sending.
  // ⚠️ This is an OPEN relay — anyone can send mail as the configured address.
  // To re-lock: set REQUIRE_SECRET=true and set MAIL_SHARED_SECRET on both
  // this service and the backend, then redeploy.
  if (process.env.REQUIRE_SECRET === 'true') {
    const expected = process.env.MAIL_SHARED_SECRET || '';
    const provided = req.headers['x-mail-secret'] || '';
    if (!expected || provided.length !== expected.length || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('⚠️  /api/send auth is DISABLED (open relay). Set REQUIRE_SECRET=true to lock it.');
  }

  // Vercel parses JSON bodies automatically; guard just in case
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { to, subject, html, text } = body || {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'to, subject, and html (or text) are required' });
  }

  try {
    await getTransporter().sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
      text,
      replyTo: SMTP_USER
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail send error:', err.message);
    return res.status(502).json({ error: 'Failed to send email', detail: err.message });
  }
};
