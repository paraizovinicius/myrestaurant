# Taste Buddy

Taste Buddy is a full-stack web application for discovering restaurants, exploring details, and managing user accounts.

This project was built to demonstrate practical engineering skills for production-oriented applications: SSR with Angular, real authentication and profile flows, remote data integration, and clean feature modularization.

## Live Project

Production URL: https://tastebuddy-blush.vercel.app

## Why This Project

- Demonstrates modern Angular (v22) with standalone components and SSR.
- Uses Supabase as a backend platform (Auth + Postgres access from the app).
- Implements end-to-end user flows: sign up, sign in, profile, password recovery.
- Focuses on UX features beyond simple CRUD: search, filters, sorting, pagination, and derived ratings/price summaries.

## Key Features

- Restaurant catalog with:
	- full-text style search
	- city/location filtering
	- price-level filtering
	- sorting (name, newest, price low/high)
	- pagination
- Restaurant details page with computed price-level aggregates.
- Review-based average rating visualization.
- Authentication flows powered by Supabase:
	- sign up
	- sign in
	- sign out
	- reset password (email flow)
	- update password route
- Profile bootstrap behavior after sign in.

## Tech Stack

- Frontend: Angular 22, TypeScript, RxJS
- Rendering: Angular SSR
- Backend integration: Supabase (`@supabase/supabase-js`)
- Server runtime: Node.js + Express-compatible SSR handler
- Deployment: Vercel (serverless function + rewrite to SSR entry)

## Architecture Overview

Workspace layout:

- `app/`: Angular application root
- `app/src/app/pages/`: feature pages (home, restaurants, details, auth, profile)
- `app/src/app/core/services/`: service layer for auth, restaurants, reviews, profiles, price level aggregation
- `app/src/app/core/supabase/`: Supabase client setup
- `app/api/index.js`: Vercel serverless entrypoint that forwards requests to built SSR server

High-level request flow:

1. Client hits Vercel route.
2. Vercel rewrite forwards to `api/index.js`.
3. Function imports SSR bundle from `dist/app/server/server.mjs`.
4. Angular server handler renders HTML and responds.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

From the repository root:

```bash
cd app
npm install
```

### Run Dev Server

```bash
npm start
```

Default URL: `http://localhost:4200`

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Environment Configuration

The Supabase client is configured via Angular environment files:

- `app/src/environments/environment.ts`
- `app/src/environments/environment.development.ts`

Expected keys:

- `supabaseUrl`
- `supabasePublishableKey`

For production and team collaboration, move credentials to environment variables and inject them during build/deploy.

## Deployment Notes (Vercel)

- Vercel rewrites all routes to `/api`.
- `api/index.js` loads the SSR output from `dist/app/server/server.mjs`.
- `vercel.json` includes `dist/app/**` in the function bundle.

## What I Would Improve Next

- Add route guards for authenticated pages.
- Add API/client error boundaries and richer loading skeletons.
- Add integration and end-to-end tests for auth and catalog flows.
- Introduce CI (lint, test, build) with pull-request checks.
- Move all secrets/config to runtime environment variables.

## Recruiter Notes

This repository is intentionally structured to highlight full-stack engineering fundamentals:

- product-focused UI behavior,
- backend-backed auth and data access,
- SSR deployment awareness,
- and clean code organization for maintainability.

If helpful, I can also provide a short architecture diagram and a concise “talk track” you can use during interviews.
