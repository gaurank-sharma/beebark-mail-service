const nodemailer = require('nodemailer');

// Reuse one transporter across warm invocations
let transporter;
const getTransporter = () => {
  if (transporter) return transporter;
  const port = Number(process.env.EMAIL_PORT) || 465;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465, // SSL on 465, STARTTLS otherwise
    auth: {
      user: process.env.EMAIL_USER || process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD
    },
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

  // Shared-secret auth. If MAIL_SHARED_SECRET is set, it's enforced.
  // If it's NOT set, the endpoint is OPEN (anyone can send) — strongly
  // discouraged for production. Set the secret to lock it down.
  const expected = process.env.MAIL_SHARED_SECRET || '';
  if (expected) {
    const provided = req.headers['x-mail-secret'] || '';
    if (provided.length !== expected.length || provided !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('⚠️  MAIL_SHARED_SECRET is not set — /api/send is UNPROTECTED (open relay).');
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
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail send error:', err.message);
    return res.status(502).json({ error: 'Failed to send email', detail: err.message });
  }
};
