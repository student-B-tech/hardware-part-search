# PartNear — Day 2

Day 2 adds authentication foundations and role-based dashboards.

## Features
- Customer / Shopkeeper registration
- Login with hashed passwords
- HTTP-only JWT session cookie
- Shopkeeper shop record creation
- Protected dashboard route
- Sign out
- MongoDB collections: users, shops

## Setup
1. Copy `.env.local.example` to `.env.local`.
2. Put your MongoDB Atlas connection string in `MONGODB_URI`.
3. Set a strong `JWT_SECRET`.
4. Run `npm install`.
5. Run `npm run dev`.

The homepage remains the Day 1 UI and the Sign in / Get Started buttons now open the real authentication screens.
