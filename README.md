# BeeBark Mail Service

A tiny, authenticated SMTP relay deployed on **Vercel**. Some hosts (e.g. Render's
free tier) block outbound SMTP, so the BeeBark backend can't send mail directly.
Vercel's network *does* allow SMTP, so the backend POSTs to this service over
HTTPS and this service does the actual sending.

## Endpoints

### `POST /api/send`
Headers:
```
Content-Type: application/json
x-mail-secret: <MAIL_SHARED_SECRET>
```
Body:
```json
{ "to": "user@example.com", "subject": "Hello", "html": "<b>Hi</b>", "text": "Hi" }
```
Responses: `200 {ok:true}` · `401` (bad secret) · `400` (missing fields) · `502` (SMTP error).

### `GET /api/health`
Returns `{ "status": "ok" }`.

## Deploy (Vercel)
1. Push this folder to a new GitHub repo.
2. Import it into Vercel (no build step needed — it's just `/api` functions).
3. Set Environment Variables (Production):
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`
   - `MAIL_SHARED_SECRET` — a long random string
4. On the **backend (Render)**, set:
   - `MAIL_SERVICE_URL` = this service's URL (e.g. `https://beebark-mail.vercel.app`)
   - `MAIL_SHARED_SECRET` = the **same** value as above

The backend automatically routes email through this service whenever
`MAIL_SERVICE_URL` is set; otherwise it falls back to direct SMTP.

## Local test
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "x-mail-secret: <secret>" \
  -d '{"to":"you@example.com","subject":"Test","html":"<b>It works</b>"}'
```
