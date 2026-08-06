# 🚀 Fix "Can't reach database server at localhost:5432" on Vercel

When your Next.js application is deployed on **Vercel**, Vercel runs in cloud serverless functions where `localhost` (127.0.0.1) does not have a PostgreSQL server running.

To fix this error, you need a **Cloud PostgreSQL Connection String** (such as from Neon.tech, Supabase, or Railway) and add it to **Vercel Environment Variables**.

---

## ⚡ Step-by-Step Fix (Takes 2 minutes)

### Step 1: Get a Free Cloud PostgreSQL Database
If you don't have a cloud database yet:
1. Go to [Neon.tech](https://neon.tech) (recommended) or [Supabase.com](https://supabase.com) and create a free account.
2. Create a new project (e.g. `mypaathshalla`).
3. Copy your database connection string (`DATABASE_URL`). It will look like this:
   ```text
   postgresql://username:password@ep-cool-sample-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Add `DATABASE_URL` to Vercel Settings
1. Go to your **Vercel Dashboard** -> Select your project (**My PaathShalla 2.0**).
2. Click **Settings** (top navigation bar) -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://username:password@ep-cool-sample-123456.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Target**: Check **Production**, **Preview**, and **Development**.
4. Click **Save**.

---

### Step 3: Push Database Tables to Cloud Postgres
From your local terminal, push your database schema to your cloud database so tables (`User`, `Assignment`, etc.) are created and seeded:

```bash
# Push schema to cloud database (replace with your Neon/Supabase URL or set it in your local .env)
DATABASE_URL="your-cloud-postgres-url" npx prisma db push

# Optional: Seed default student and teacher accounts to cloud database
DATABASE_URL="your-cloud-postgres-url" node prisma/seed.js
```

---

### Step 4: Redeploy on Vercel
1. Go back to Vercel Dashboard -> **Deployments**.
2. Click the `...` menu next to your latest deployment -> Click **Redeploy**.

---

## 🔑 Summary of Required Vercel Environment Variables

In your Vercel Project Settings -> **Environment Variables**, ensure you have:

| Variable Name | Value Description |
|---|---|
| `DATABASE_URL` | Cloud PostgreSQL URL from Neon/Supabase (`postgresql://...`) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain URL (e.g. `https://my-paathshalla-2-0.vercel.app`) |
| `LIVEKIT_API_KEY` | LiveKit API Key (`APIDi33ZJiP3exb`) |
| `LIVEKIT_API_SECRET` | LiveKit Secret Key |
| `NEXT_PUBLIC_LIVEKIT_URL` | `wss://my-paathshalla-2mk1y57r.livekit.cloud` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (optional) |
