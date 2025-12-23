# Vercel Deployment Guide

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (sign up at https://vercel.com)

## Step-by-Step Deployment

### 1. Create Vercel Account & Import Project

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import your repository: `rinaldypasya/aidmi-session-notes`
4. Vercel will auto-detect Next.js settings

### 2. Add Vercel Postgres Database

1. In the project import screen, go to the **"Storage"** tab
2. Click **"Create"** under Postgres
3. Or after deployment, go to your project dashboard → **Storage** → **Create Database** → **Postgres**
4. Vercel will automatically:
   - Create the database
   - Add `DATABASE_URL` and `DIRECT_URL` environment variables
   - Connect them to your project

### 3. Configure Environment Variables

The Postgres database will auto-populate these variables:
- ✅ `DATABASE_URL` - Already added by Vercel Postgres
- ✅ `DIRECT_URL` - Already added by Vercel Postgres (optional but recommended)

### 4. Run Database Migrations

After the first deployment, you need to set up your database schema:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env

# Run Prisma migration
npx prisma db push

# Seed the database
npm run db:seed
```

**Option B: Using Vercel Dashboard**

1. Go to your project's **Settings** → **Functions**
2. Add a temporary API route to run migrations:
   - Create `src/app/api/migrate/route.ts` (see below)
   - Visit `https://your-app.vercel.app/api/migrate` once
   - Delete the route after migration

**Migration API Route Example:**

```typescript
// src/app/api/migrate/route.ts
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()

  // This will apply the schema to the database
  // Note: In production, use proper migrations

  return Response.json({
    message: 'Run migrations using Vercel CLI or Prisma Migrate'
  })
}
```

### 5. Deploy

Click **"Deploy"** and Vercel will:
- Install dependencies
- Run `prisma generate` (via postinstall script)
- Build your Next.js app
- Deploy to production

### 6. Seed Database (Optional)

To add sample data:

```bash
# Using Vercel CLI with environment variables
vercel env pull .env
npm run db:seed
```

Or create a temporary seed API endpoint similar to the migration route.

## Post-Deployment Checklist

- ✅ Visit your deployed app URL
- ✅ Check that the database connection works
- ✅ Verify the favicon appears
- ✅ Test creating/editing sessions (if seeded)

## Troubleshooting

### Build Fails: "Can't reach database server"
- **Solution**: Make sure Vercel Postgres is created and environment variables are set

### Prisma Client Not Found
- **Solution**: The `postinstall` script in package.json should handle this automatically. Check build logs.

### Database Schema Not Applied
- **Solution**: Run `npx prisma db push` using Vercel CLI after pulling environment variables

## Local Development with Production Database

If you want to test against the production database locally:

```bash
# Pull production environment variables
vercel env pull .env.local

# Use the production database
npm run dev
```

⚠️ **Warning**: Be careful not to corrupt production data. Consider using a separate staging database.

## Alternative: Local PostgreSQL for Development

If you want to keep using SQLite locally and PostgreSQL in production:

1. Keep a local `.env` file with SQLite:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Update [prisma/schema.prisma](prisma/schema.prisma) to support both:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. For local SQLite, temporarily change provider to "sqlite" when developing locally.

## Useful Commands

```bash
# View production logs
vercel logs

# Open Prisma Studio for production DB
vercel env pull .env
npx prisma studio

# Redeploy
vercel --prod
```

## Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Questions?** Check the Vercel deployment logs for detailed error messages.
