# Render deployment

This repository is a monorepo with a Node/Express + Socket.IO backend at the
repository root and a Vite/React frontend in `frontend/`. Deploy them as two
Render services so the API can keep its Socket.IO server running.

## 1. Prepare the repository

- Commit both `package-lock.json` files. The repository `.gitignore` used to
  ignore them; they are now allowed so Render can use reproducible installs.
- Keep `.env` files out of Git. The checked-in `.env.example` files contain
  names and placeholders only.
- Push the deployment commit to the branch you want Render to deploy.

The backend has a production `start` script (`npm start`), a `/health` endpoint,
and binds to Render's `PORT` on `0.0.0.0`. Its scheduled merchant-status job is
started once per process. Keep this service at one instance until that job is
protected by a distributed lock; each additional backend instance would start
another scheduler.

## 2. Create the backend Web Service

In Render, create a **Web Service** from this repository and use:

| Setting | Value |
| --- | --- |
| Root Directory | repository root (leave blank) |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

After the first successful deploy, generate a public domain for the service.
Use that HTTPS domain for `VITE_API_URL` and `VITE_SOCKET_URL` below.

### Backend environment variables

Set these in the backend service's **Environment** tab. Do not commit real
values or put backend secrets in the frontend service.

- `NODE_ENV=production`
- `ACCESS_TOKEN_SECRET_KEY`, `REFRESH_TOKEN_SECRET_KEY`, `TEMP_TOKEN_SECRET_KEY`
- `MONGODB_URI`, `REDIS_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET`
- `OPENROUTE_API_KEY`
- `PAYMONGO_SECRET_KEY`, `PAYMONGO_PUBLIC_KEY`, `PAYMONGO_WEBHOOK_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `ADMIN_EMAIL`, `ADMIN_PASS`, `ADMIN_PHONENUMBER`
- `CLIENT_URL` (the frontend's exact HTTPS origin, without a path or trailing slash)

Render provides `PORT`; the code falls back to `10000` for local/configuration
safety, so normally do not set `PORT` yourself. The three admin values are
required by the startup seeding function. Use a strong password and keep these
values private.

Use PayMongo test keys and a test webhook secret while validating. Before real
payments, switch to the live credentials and register this webhook URL in
PayMongo:

`https://<backend-domain>/api/v1/payment/webhook`

## 3. Create the frontend Static Site

Create a **Static Site** from the same repository and use:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Add these frontend environment variables before the first build:

- `VITE_API_URL=https://<backend-domain>/api/v1`
- `VITE_SOCKET_URL=https://<backend-domain>`

Vite embeds these values into the built JavaScript, so changing either value
requires a frontend rebuild/redeploy. These two values are public URLs, never
secret credentials.

In the static site's **Redirects/Rewrites** settings, add a rewrite:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

This lets React Router serve nested routes after a browser refresh.

## 4. Connect origins and verify cookies

Copy the exact static-site origin (for example, `https://speed-menu.onrender.com`)
to the backend's `CLIENT_URL`, then redeploy the backend. HTTP and Socket.IO
CORS both use this value and credentials are enabled.

Authentication uses HTTP-only cookies with `SameSite=Strict`. Test login,
refresh, and logout from the deployed frontend. If browser cookie rules prevent
cookies from reaching the API, use frontend and API custom domains under the
same parent domain (for example, `app.example.com` and `api.example.com`) or
make a deliberate cookie-policy change for cross-site cookies. Keep cookies
`Secure` in production.

## 5. Validate the deployment

1. Open `https://<backend-domain>/health`; it should return `{ "status": "ok" }`.
2. Open the frontend and test sign-in, refresh, and sign-out.
3. Test image upload, route/distance calculation, and email delivery.
4. Connect a driver and verify the Socket.IO connection and order events.
5. Place a PayMongo test payment and confirm the webhook updates its status.
6. Check Render logs for startup errors and verify the merchant-status schedule
   is not running more than once per three-minute interval.

Render's free web services spin down after inactivity. That is suitable for an
initial smoke test, but it can delay API and Socket.IO reconnection when the
service wakes. Choose an always-on plan for dependable live delivery updates.
