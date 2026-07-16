#!/bin/bash
# ════════════════════════════════════════════════════════
#  FIRST DEPLOYMENT SCRIPT
#  Run this AFTER setup-server.sh and uploading your code
#  Usage: cd /var/www/roopal && bash deploy/deploy.sh
# ════════════════════════════════════════════════════════

set -e

DEPLOY_DIR="/var/www/roopal"
cd "$DEPLOY_DIR"

echo "========================================="
echo "  Deploying — Makeup by Roopal Goel"
echo "========================================="

# ── Check .env exists ──
if [ ! -f "server/.env" ]; then
    echo "❌ ERROR: server/.env not found!"
    echo "   Create it first: nano server/.env"
    echo "   See: deploy/.env.production"
    exit 1
fi

# ── Install dependencies ──
echo "▸ Installing dependencies..."
npm install --prefix server
npm install --prefix client

# ── Build React frontend ──
echo "▸ Building React frontend..."
npm run build --prefix client

# ── Create logs directory ──
mkdir -p logs

# ── Ensure uploads directory exists ──
mkdir -p server/uploads

# ── Start with PM2 ──
echo "▸ Starting server with PM2..."
if pm2 describe "makeup-roopal" > /dev/null 2>&1; then
    pm2 restart makeup-roopal --update-env
    echo "  Restarted existing process"
else
    pm2 start ecosystem.config.js
    pm2 save
    echo "  Started new process"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Deployment complete!"
echo "═══════════════════════════════════════"
echo ""
echo "  Server running on: http://localhost:5000"
echo "  Check status:      pm2 status"
echo "  View logs:         pm2 logs makeup-roopal"
echo ""
