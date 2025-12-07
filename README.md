# Product Review Dashboard

A minimal, password-protected Next.js dashboard for reviewing products stored in Postgres. Log in with a single password, view items in a responsive grid, approve/reject them, and add new products manually. Built with Next.js (App Router + TypeScript), Prisma, Tailwind, and PostgreSQL (Neon ready).

## Tech stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon for production)

## Prerequisites
- Node.js 18+
- npm (bundled with Node)
- A PostgreSQL connection string (Neon recommended)

## Environment variables
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

- `DATABASE_URL` – Postgres connection string (Neon: use the provided pooled/primary URL; keep `sslmode=require`).
- `LOGIN_PASSWORD` – Password required on `/login` (default is `yanya`) for reviewer access (approve/reject existing items).
- `ADMIN_PASSWORD` – Admin password (default `admin123`) with full access, including adding and deleting products.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
3. Run the initial migration (creates the `Product` table):
   ```bash
   npx prisma migrate dev --name init
   ```
   For production/CI, use `npx prisma migrate deploy` against your Neon database.
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/login`, enter the password, and you’ll be redirected to `/`.

## Database model
`prisma/schema.prisma` defines the `Product` model:
- `id` (cuid primary key)
- `title` (string)
- `description` (string, optional)
- `imageUrls` (string array)
- `productUrl` (string)
- `price` (decimal, @db.Decimal(10,2))
- `status` (enum: `PENDING | APPROVED | REJECTED`)
- `createdAt`, `updatedAt`

## Neon Postgres notes
- Create a Neon project/database and copy the connection string from the dashboard.
- Use the pooled connection for API routes or the primary connection for migrations.
- Ensure `sslmode=require` is present in the URL (Neon default).
- Run migrations after updating the schema: `npx prisma migrate dev --name <change>` (dev) or `npx prisma migrate deploy` (prod).

## Auth & protection
- Password-only auth; no users are stored.
- Login sets an HttpOnly cookie session. `middleware.ts` redirects unauthenticated users from `/` to `/login` and blocks protected APIs.
- Change passwords via `LOGIN_PASSWORD` (reviewer) or `ADMIN_PASSWORD` (admin) in your env file.
- Logout anytime from the dashboard via the **Logout** button (clears the session cookie and returns to `/login`).

## How to use
- Log in at `/login` with the configured password.
- On `/`, view all products in a responsive grid with status badges.
- Click Approve or Reject on any card to update its status (optimistic UI).
- Admins can add new entries (default status `PENDING`) with multiple image URLs (one per line or comma-separated) and delete products. Reviewer password users can approve/reject existing products but cannot add or delete.

## Scripts
- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm start` – start production server
- `npm run lint` – lint the codebase
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:migrate` – run `prisma migrate dev`
- `npm run prisma:studio` – open Prisma Studio

## Deployment
- Set `DATABASE_URL`, `LOGIN_PASSWORD`, and `ADMIN_PASSWORD` in your hosting provider (Vercel, etc.).
- Run migrations in CI/production with `npx prisma migrate deploy` before `next start`.
- The app is ready for Neon; no extra drivers are needed beyond the connection string.
