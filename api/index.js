// GET / — friendly status page so the root doesn't show Vercel's 404
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BeeBark Mail Service</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: radial-gradient(1200px 600px at 50% -10%, #fff7e0, #ffffff);
        color: #1A1A1A;
      }
      .card {
        text-align: center; padding: 40px 44px; border: 1px solid #ECECEC; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,.06); background: #fff; max-width: 420px;
      }
      .badge {
        display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
        color: #166534; background: #dcfce7; padding: 6px 12px; border-radius: 999px;
      }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
      .logo {
        width: 56px; height: 56px; border-radius: 16px; background: #1A1A1A; color: #FFC107;
        display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 28px;
        margin: 0 auto 20px;
      }
      h1 { margin: 0 0 8px; font-size: 22px; }
      p { margin: 6px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6; }
      code { background: #F4F5F7; padding: 2px 6px; border-radius: 6px; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">B</div>
      <div class="badge"><span class="dot"></span> Service is live</div>
      <h1>BeeBark Mail Service</h1>
      <p>Authenticated SMTP relay is running.</p>
      <p>Endpoints: <code>POST /api/send</code> · <code>GET /api/health</code></p>
    </div>
  </body>
</html>`);
};
