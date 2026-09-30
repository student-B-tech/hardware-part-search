# PartNear — Day 2 Shopkeeper Inventory

This version continues the working Neon + Prisma + authentication project.

## Added
- Shop profile create/update
- Product add/edit/delete
- Inventory quantity
- Stock status: Available / Low / Out of stock
- Inventory summary cards
- Real database APIs under `/api/shop` and `/api/products`

## Setup
Keep your local `.env.local` with:
DATABASE_URL="your-neon-url"
JWT_SECRET="your-secret"

Then:
npm install
npx prisma generate
npx prisma db push
npm run dev

Open `/dashboard` as a shopkeeper.
