# 🚀 Hostinger Deployment Guide for My PaathShalla 2.0

This guide will walk you through hosting **My PaathShalla 2.0** (Next.js 14 + Prisma ORM + LiveKit) on Hostinger using the **Hostinger Git Connector** and **Node.js Web Application Manager**.

---

## 📋 Step 1: Database Setup (PostgreSQL)

Hostinger standard web hosting provides MySQL databases by default. Because **My PaathShalla 2.0** uses PostgreSQL, you need a PostgreSQL database URL.

### Recommended (Free & Instant): **Neon.tech** or **Supabase**
1. Sign up for a free PostgreSQL database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Create a new database project named `mypaathshalla`.
3. Copy your PostgreSQL connection string (`DATABASE_URL`). It will look like:
   ```text
   postgresql://username:password@ep-sample-12345.us-east-1.aws.neon.tech/mypaathshalla?sslmode=require
   ```

---

## 🐙 Step 2: Push Your Repository to GitHub / GitLab

1. If you haven't pushed your code to GitHub, commit your changes:
   ```bash
   git add .
   git commit -m "Configure server.js and Hostinger deployment scripts"
   git push origin main
   ```

---

## ⚙️ Step 3: Deploying via Hostinger Git Connector & Node.js App Manager

### Option A: Using Hostinger hPanel Node.js Application Manager

1. Log into your **Hostinger hPanel**.
2. Go to **Websites** -> Select your domain -> Navigate to **Advanced** -> **Node.js**.
3. Click **Create Application** (or **Setup Node.js App**):
   - **Node.js version**: Choose `18.x` or `20.x`
   - **Application Mode**: Select `Production`
   - **Application Root**: `/` (or your project directory, e.g. `public_html` or `mypaathshalla`)
   - **Application URL**: Your domain (e.g. `https://yourdomain.com`)
   - **Application Startup File**: `server.js`
4. Click **Create / Save**.

---

## 🔑 Step 4: Configure Environment Variables in Hostinger hPanel

Under your Node.js application settings in hPanel, add the following **Environment Variables**:

| Variable Name | Example Value / Instructions |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your PostgreSQL connection string from Neon/Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` (Your Hostinger domain) |
| `LIVEKIT_API_KEY` | Your LiveKit API key |
| `LIVEKIT_API_SECRET` | Your LiveKit secret key |
| `NEXT_PUBLIC_LIVEKIT_URL` | `wss://YOUR_LIVEKIT_URL.livekit.cloud` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID (if using Google login) |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |

---

## 🛠️ Step 5: Install Dependencies & Run Database Migrations

Run the following commands in the **Hostinger Terminal / SSH** (or via the **Run NPM Command** button in hPanel):

```bash
# 1. Install Node modules
npm install

# 2. Sync database schema with PostgreSQL
npx prisma db push

# 3. Build Next.js production bundle
npm run build
```

---

## ▶️ Step 6: Start / Restart Application

1. In Hostinger hPanel -> **Node.js**, click **Restart Application**.
2. Visit your domain (`https://yourdomain.com`) to verify that the website, API routes, live classroom, live chat, and database sub-systems are working!

---

## 🔍 Troubleshooting Tips

- **500 Internal Server Error / 502 Bad Gateway**:
  - Verify that `DATABASE_URL` is correct and accessible.
  - Check Node.js application logs in hPanel under **Logs / stderr.log**.
- **Static Assets or Styling Missing**:
  - Ensure `npm run build` was run successfully after setting environment variables.
- **Port Conflict**:
  - `server.js` uses `process.env.PORT` automatically assigned by Hostinger Passenger. Do not hardcode a fixed port in Hostinger production.
