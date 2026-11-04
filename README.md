# Speed

![CI](https://github.com/CabutinBenciel0425/speed/actions/workflows/ci.yml/badge.svg)

A full-stack food delivery platform for Metro Manila. Customers order from local merchants, drivers are dispatched in real time, and delivery fees are computed from actual road distance.

**Live demo:** <add your Render URL here>

## Features

- **Four roles:** Customer, Merchant, Driver and Admin, with a role-profile architecture (separate `CustomerProfile`, `MerchantProfile` and `DriverProfile` collections on top of a shared auth core)
- **Ordering:** browse by category, search, cart, checkout, order tracking
- **Payments:** PayMongo integration with webhook handling
- **Real-time dispatch:** Socket.IO with geo-queries to find nearby drivers, plus live driver status updates (heading to merchant, arrived at merchant, and so on)
- **Delivery fee by distance:** road distance from OpenRouteService, not straight-line
- **Addresses:** multi-step address form backed by the PSGC API
- **Reviews and favorites** for merchants
- **Notifications** for order and delivery events

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Node.js, Express, TypeScript (run with `tsx`), MongoDB + Mongoose, Redis, Socket.IO |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Zustand, react-hook-form + zod |
| Services | PayMongo (payments), OpenRouteService (routing), Cloudinary (images), SMTP email |
| Infra | Docker, GitHub Actions CI, Render |

## How it works

- **Auth:** JWT access and refresh tokens in `httpOnly` cookies. Refresh tokens are also stored in Redis (`refresh_token:<userId>-<activeRole>`), so a session can be revoked server-side. The frontend axios interceptor refreshes expired access tokens and queues requests while it does.
- **Transactions:** order flows use Mongoose transactions, so MongoDB must run as a **replica set** (MongoDB Atlas does by default).
- **Rate limiting:** Redis-backed limiter on the API.
- **Health check:** `GET /health` returns `{ "status": "ok" }`.

## Project structure

```
.
├── backend/            # Express API, Socket.IO handlers, Mongoose models
│   ├── controller/
│   ├── lib/            # db, redis, rate limiter, OpenRouteService, PayMongo webhook
│   ├── utils/
│   └── server.ts
├── frontend/           # React + Vite app
│   └── src/
├── .github/workflows/  # CI
├── Dockerfile
├── compose.yaml
└── .env.example
```

## Getting started

### Prerequisites

- Node.js 24+
- MongoDB running as a replica set (Atlas free tier works)
- Redis
- Accounts and keys for PayMongo, OpenRouteService and Cloudinary

### 1. Clone and install

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
cd frontend
npm install
cd ..
```

### 2. Configure environment

```powershell
Copy-Item .env.example .env
```

Then fill in the values (see [Environment variables](#environment-variables)).

### 3. Run the backend

```powershell
npm start
```

The API listens on `PORT` (default `10000` if unset).

### 4. Run the frontend

```powershell
cd frontend
npm run dev
```

## Run with Docker

The Docker setup runs the API. MongoDB and Redis are external, so point `MONGODB_URI` and `REDIS_URL` at them in `.env`.

```powershell
docker compose up --build
```

`compose.yaml` loads `.env` and maps host port **8088** to container port **5050**, so set `PORT=5050` in `.env`. The API is then at `http://localhost:8088`.

To run the image without Compose, pass the env file yourself:

```powershell
docker build -t speed .
docker run -d --name speed-api --env-file .env -p 8088:5050 speed
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the API listens on |
| `CLIENT_URL` | Frontend origin, used for CORS and cookies |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string (the server will not start without it) |
| `ACCESS_TOKEN_SECRET_KEY` | Secret for access tokens |
| `REFRESH_TOKEN_SECRET_KEY` | Secret for refresh tokens |
| `TEMP_TOKEN_SECRET_KEY` | Secret for short-lived temporary tokens |
| `PAYMONGO_SECRET_KEY` | PayMongo secret key |
| `PAYMONGO_PUBLIC_KEY` | PayMongo public key |
| `PAYMONGO_WEBHOOK_SECRET` | Verifies PayMongo webhook signatures |
| `OPENROUTE_API_KEY` | OpenRouteService API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Sender email account |
| `EMAIL_PASS` | Sender email password or app password |
| `ADMIN_EMAIL` | Initial admin account email |
| `ADMIN_PASS` | Initial admin account password |
| `ADMIN_PHONENUMBER` | Initial admin account phone number |
| `RANDOM_PROFILE_URL` | Default profile picture URL |

Never commit `.env`. Use long random strings for the three token secrets.

## API overview

All routes are under `/api/v1`:

`auth` · `address` · `cart` · `category` · `product` · `search` · `merchant` · `driver` · `orders` · `payment` · `notification` · `review` · `location` · `admin`

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| root | `npm start` | Runs the API with `tsx` |
| root | `npx tsc --noEmit` | Type-checks the backend |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run lint` | ESLint |
| `frontend/` | `npm run build` | Type-check and production build |

## CI

GitHub Actions runs on every pull request and on pushes to `main`:

- **backend:** `npm ci` and a TypeScript type-check
- **frontend:** `npm ci`, lint and production build
- **docker:** builds the Docker image

## Deployment

The API is deployed on Render as a Node web service. It binds to `0.0.0.0` and reads `PORT` from the environment (Render sets it). Set the same environment variables in the Render dashboard.
