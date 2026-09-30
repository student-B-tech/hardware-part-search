# PartNear — Day 2 (Neon + Prisma)

Day 2 moves PartNear from MongoDB to Neon PostgreSQL using Prisma.

## 1. Install

```bash
npm install
```

## 2. Configure Neon

Create `.env.local` in the project root and add:

```env
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="your-long-random-secret"
```

Do not commit `.env.local`.

## 3. Generate Prisma Client

```bash
npm run prisma:generate
```

## 4. Create the database tables

```bash
npm run prisma:push
```

## 5. Start

```bash
npm run dev
```

Open http://localhost:3000/register and create a test account.

## Database models

- User
- Shop
- Product
- Inventory
- Bill
- BillItem

The schema is intentionally ready for Day 3 product/inventory search and later AI bill processing.
