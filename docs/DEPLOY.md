# Deployment Guide

End-to-end deployment of `atozfamily-planner` to `planner.atozfamily.org`. Assumes you start from zero. Estimated time: 30–45 minutes.

## Prerequisites (one-time)

- Node.js 20+ installed
- npm or pnpm
- A GitHub account
- An empty repo for this project (we'll push to it)

## Step 1 — Sign up for services (15 min)

### Neon (Postgres database)

1. Go to https://neon.tech → sign up
2. Create a new project (region: US West if you can pick)
3. From the dashboard, copy two connection strings:
   - **Pooled connection** → goes in `DATABASE_URL`
   - **Direct connection** → goes in `DIRECT_DATABASE_URL`
4. Both end with `?sslmode=require`

### Resend (email magic links)

1. Go to https://resend.com → sign up
2. Domains → Add Domain → `atozfamily.org`
3. Add the DNS records Resend gives you to your DNS provider
   - Typically: 1× MX, 1× TXT (SPF), 1× TXT (DKIM)
4. Wait for verification (usually < 10 min)
5. API Keys → Create API Key → name it `atozfamily-planner`
6. Copy the key (starts with `re_`) → goes in `RESEND_API_KEY`

### Vercel (hosting)

1. Go to https://vercel.com → sign up with GitHub
2. We'll create the project in Step 4

## Step 2 — Push code to GitHub

```bash
cd atozfamily-planner

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create a private GitHub repo (via gh CLI or web UI)
gh repo create atozfamily-planner --private --source=. --push
# Or manually create on github.com then:
# git remote add origin git@github.com:YOU/atozfamily-planner.git
# git push -u origin main
```

## Step 3 — Configure environment

Create `.env` from the template:

```bash
cp .env.example .env
```

Fill in the values:

```bash
# From Neon
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# Generate a random secret
AUTH_SECRET="$(openssl rand -base64 32)"

# Your future production URL
AUTH_URL="https://planner.atozfamily.org"

# From Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="planner@atozfamily.org"

# The two emails who can sign in (NO OTHERS will be permitted)
ALLOWED_EMAILS="you@gmail.com,your-wife@gmail.com"
```

## Step 4 — Test locally

```bash
npm install
npx prisma db push       # creates tables in Neon
npx tsx prisma/seed.ts   # seeds children, terms, default state
npm run dev
```

Open http://localhost:3000 → you should hit the sign-in page.

Enter one of your `ALLOWED_EMAILS` values. Since `RESEND_API_KEY` IS configured, you'll get a real email. **Or**, temporarily comment out the `RESEND_API_KEY` line in `.env` to see the magic link printed to your terminal instead.

Click the link → land in `/planner`. You should see the empty planner.

## Step 5 — Deploy to Vercel

### Via Vercel dashboard (recommended)

1. https://vercel.com/new → import your GitHub repo
2. Framework preset: **Next.js** (auto-detected)
3. **Environment Variables** — add ALL of these (copy from your `.env`):
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`  *(use `https://planner.atozfamily.org` here even before DNS is set)*
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `ALLOWED_EMAILS`
4. Click **Deploy**
5. Wait ~2 minutes for build

### Via CLI (alternative)

```bash
npm i -g vercel
vercel login
vercel link    # link to existing or create new project
vercel env add DATABASE_URL production
# ... repeat for each env var
vercel --prod
```

## Step 6 — Custom domain (DNS)

1. In Vercel → your project → Settings → Domains → Add `planner.atozfamily.org`
2. Vercel shows you the DNS record needed. Add it at your DNS provider:
   - **Type**: CNAME
   - **Name**: `planner`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: Auto (or 300)
3. Wait 5–60 min for DNS propagation
4. Vercel auto-issues SSL cert when DNS resolves

## Step 7 — Verify

1. Visit https://planner.atozfamily.org
2. Should redirect to `/signin`
3. Sign in with allowlisted email → check inbox → click magic link
4. Land on `/planner` with the empty UI

## Step 8 — Hand to your wife

1. Make sure her email is in `ALLOWED_EMAILS`
2. Send her: `https://planner.atozfamily.org`
3. She signs in with her own magic link
4. Both of you now see the same shared planner state

## Common issues

**"Sign-in failed. Check that you used an allowlisted email."**
→ Email not in `ALLOWED_EMAILS`. Update env var in Vercel, redeploy.

**Magic link email never arrives**
→ Check Resend dashboard → Logs. Common causes: domain not verified, sender email doesn't match a verified domain.

**Database errors at startup**
→ Run `npx prisma db push` against production database. Verify connection strings have `?sslmode=require`.

**"Module not found: @prisma/client"**
→ Run `npx prisma generate` (or it should run automatically via `postinstall`).

**500 errors on `/api/state`**
→ Check Vercel function logs. Usually a missing env var or Prisma client not generated for production build.

## Updating

```bash
git pull
npm install         # if deps changed
npx prisma db push  # if schema changed
git push            # Vercel auto-deploys
```
