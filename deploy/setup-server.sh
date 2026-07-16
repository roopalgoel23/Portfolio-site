#!/bin/bash
# ════════════════════════════════════════════════════════
#  ONE-TIME SERVER SETUP SCRIPT
#  Run this ONCE on a fresh Hostinger VPS (Ubuntu/Debian)
#  Usage: bash setup-server.sh
# ════════════════════════════════════════════════════════

set -e

echo "========================================="
echo "  Server Setup — Makeup by Roopal Goel"
echo "========================================="

# ── Update system ──
echo "▸ Updating system packages..."
apt update && apt upgrade -y

# ── Install Node.js 20.x ──
echo "▸ Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ── Install PM2 ──
echo "▸ Installing PM2..."
npm install -g pm2

# ── Install Nginx ──
echo "▸ Installing Nginx..."
apt install -y nginx

# ── Create deployment directory ──
DEPLOY_DIR="/var/www/roopal"
echo "▸ Creating deployment directory: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# ── Install Certbot (for SSL) ──
echo "▸ Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# ── PM2 startup on boot ──
echo "▸ Configuring PM2 to start on boot..."
pm2 startup systemd -u root --hp /root
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Server setup complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Upload your code to: $DEPLOY_DIR"
echo "  2. Create .env file at: $DEPLOY_DIR/server/.env"
echo "  3. Run: cd $DEPLOY_DIR && npm run deploy"
echo "  4. Set up Nginx: see deploy/nginx.conf"
echo "  5. Set up SSL: certbot --nginx -d YOUR_DOMAIN"
echo ""
