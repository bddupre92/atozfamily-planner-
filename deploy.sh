#!/usr/bin/env bash
# ============================================================================
# atozfamily-planner — one-shot deployment script
# ============================================================================
# Prereqs (one-time, do these manually first):
#   1. Install Node 20+, pnpm or npm, and gh CLI
#   2. Sign up: neon.tech, vercel.com, resend.com
#   3. Create a Neon project — copy the connection string
#   4. Verify atozfamily.org on Resend, create an API key
#   5. Add this directory to git
#
# Then run: ./deploy.sh
# ============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
say() { echo -e "${GREEN}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
die() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Pre-flight ─────────────────────────────────────────────────────────────
command -v node >/dev/null || die "Node.js required"
command -v npm >/dev/null || die "npm required"
[[ -f .env ]] || die "Create .env from .env.example first and fill in real values"

say "Pre-flight checks passed"

# ── Install dependencies ───────────────────────────────────────────────────
say "Installing dependencies..."
npm install

# ── Database setup ─────────────────────────────────────────────────────────
say "Running Prisma migration..."
npx prisma generate
npx prisma db push   # use 'migrate dev' if you want migration history

say "Seeding database..."
npx tsx prisma/seed.ts

# ── Vercel deployment ──────────────────────────────────────────────────────
if command -v vercel >/dev/null; then
  say "Deploying to Vercel..."
  vercel --prod
else
  warn "Vercel CLI not installed. Install with: npm i -g vercel"
  warn "Then run: vercel --prod"
fi

# ── DNS instructions ───────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  NEXT STEPS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. In Vercel dashboard, add custom domain:"
echo "   → planner.atozfamily.org"
echo ""
echo "2. In your DNS provider, add CNAME record:"
echo "   → Name:  planner"
echo "   → Type:  CNAME"
echo "   → Value: cname.vercel-dns.com"
echo ""
echo "3. Wait for DNS propagation (5–60 min)"
echo ""
echo "4. Verify https://planner.atozfamily.org loads sign-in page"
echo ""
echo "5. Sign in with an email in your ALLOWED_EMAILS list"
echo ""
echo "════════════════════════════════════════════════════════════"
