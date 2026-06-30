# Farmers Market Marketplace (scaffold)

Monorepo scaffold with a Next.js frontend and Express backend using Prisma + SQLite for local development.

## Quick start

```bash
# from repo root
npm install
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# edit backend/.env with your Razorpay keys if needed
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ..
npm run dev
```

## Run tests

```bash
npm test
```

## Docker deployment (local)

```bash
docker-compose up --build
```

## CI

A GitHub Actions workflow is available at `.github/workflows/ci.yml`.

## Test accounts

- Farmer: `alice@example.com` / `password`
- Customer: `bob@example.com` / `password`
- Admin: `admin@example.com` / `password`

## Features included

- User auth with register/login (`backend/src/routes/auth.js`)
- Farmer registration and profile creation
- Product listing, search, cart, and checkout workflows
- Order creation with pickup/delivery options
- Farmer dashboard and admin panel pages
- Basic order status update flow for farmer/admin users
- Razorpay order creation stub in `backend/src/index.js`
- Local frontend cart and checkout pages

## Notes

- The backend uses SQLite for local development and stores data in `backend/dev.db`.
- The current deployment scaffold uses `docker-compose.yml` for local containers.
- The MVP is functional but does not yet include payment processing production flows, review moderation, or audit logging.
