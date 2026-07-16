# 🚀 Deployment Guide — Hostinger VPS

Complete step-by-step guide to deploy Makeup by Roopal Goel on a Hostinger VPS.

---

## Prerequisites

1. **Hostinger VPS** (KVM 1 or higher — Ubuntu 22.04/24.04)
2. **Domain** (free with Hostinger, or use an existing one)
3. **GitHub repo** with your code pushed to it

---

## Step 1: Buy VPS & Point Domain

1. Log into **Hostinger** → VPS → Deploy new server
2. Choose **Ubuntu 22.04** template
3. Choose plan: **KVM 1** (1 vCPU, 4GB RAM, 50GB) — sufficient for this site
4. Note your **VPS IP address** (e.g., `82.xxx.xxx.xxx`)
5. Go to **Domains** → point your domain's **A record** to the VPS IP:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP
   TTL: 3600
   ```
   Add a second record for www:
   ```
   Type: A
   Name: www
   Value: YOUR_VPS_IP
   TTL: 3600
   ```

---

## Step 2: Push Code to GitHub

On your local machine:

```bash
cd C:\roopal_portfolio
git init
git add .
git commit -m "Initial commit — production ready"
git remote add origin https://github.com/YOUR_USERNAME/roopal-portfolio.git
git push -u origin main
```

⚠️ **Make sure `.gitignore` excludes `.env` files** — your secrets should NOT go to GitHub.

---

## Step 3: SSH into the VPS

From Hostinger dashboard, get your SSH credentials, then connect:

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 4: Run Server Setup (One-Time)

```bash
# Clone your repo
cd /var/www
git clone https://github.com/YOUR_USERNAME/roopal-portfolio.git roopal
cd roopal

# Run the one-time setup script
bash deploy/setup-server.sh
```

This installs: **Node.js 20, PM2, Nginx, Certbot (SSL)**.

---

## Step 5: Create Production .env

```bash
nano /var/www/roopal/server/.env
```

Paste your production values (use `deploy/.env.production` as template):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://makeupbyroopalgoel_db_user:YOUR_PASSWORD@portfoliosite.c0qvnnt.mongodb.net/makeup_roopal_goel?retryWrites=true&w=majority
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=Makeupbyroopalgoel@gmail.com
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=Makeupbyroopalgoel@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
CONTACT_TO_EMAIL=Makeupbyroopalgoel@gmail.com
CONTACT_FROM_NAME=Portfolio Enquiry
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## Step 6: Deploy

```bash
cd /var/www/roopal
bash deploy/deploy.sh
```

This will:
- Install all dependencies
- Build the React frontend
- Start the Node.js server with PM2

Verify it's running:
```bash
pm2 status
curl http://localhost:5000/api/health
```

---

## Step 7: Configure Nginx

```bash
# Copy the nginx config
cp /var/www/roopal/deploy/nginx.conf /etc/nginx/sites-available/roopal

# Edit it — replace YOUR_DOMAIN with your actual domain
nano /etc/nginx/sites-available/roopal

# Enable the site
ln -s /etc/nginx/sites-available/roopal /etc/nginx/sites-enabled/

# Remove default site (optional)
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

Your site should now be live at `http://YOUR_DOMAIN`!

---

## Step 8: Enable SSL (HTTPS)

```bash
certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Follow the prompts. Certbot will:
- Generate SSL certificate (free, via Let's Encrypt)
- Auto-configure Nginx for HTTPS
- Set up auto-renewal

Your site is now at **`https://YOUR_DOMAIN`** ✅

---

## Step 9: Update MongoDB Atlas IP Access

1. Go to **MongoDB Atlas** → Network Access
2. Click **Add IP Address** → Allow access from anywhere (`0.0.0.0/0`)
   - Or add your VPS IP specifically (more secure)

---

## Updating the Site Later

When you make changes locally and push to GitHub:

```bash
# On the VPS:
cd /var/www/roopal
git pull
npm run deploy:restart
```

Or use the one-liner:
```bash
cd /var/www/roopal && git pull && npm run deploy:restart
```

---

## Useful Commands

```bash
# Check server status
pm2 status

# View server logs
pm2 logs makeup-roopal

# Restart server
pm2 restart makeup-roopal

# Stop server
pm2 stop makeup-roopal

# Restart Nginx
systemctl restart nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check SSL certificate status
certbot certificates
```

---

## Architecture Summary

```
Internet → Nginx (port 80/443) → Node.js/Express (port 5000)
                                   ├── API routes (/api/*)
                                   ├── React build (client/dist)
                                   └── Uploaded images (/uploads)

MongoDB Atlas (cloud) ←── Mongoose connection
```

## Cost Breakdown

| Item | Cost |
|------|------|
| Hostinger KVM 1 | ~$4–7/month |
| Domain | FREE (year 1), ~$10/year after |
| MongoDB Atlas | FREE (512MB tier) |
| SSL Certificate | FREE (Let's Encrypt) |
| **Total** | **~$4–7/month** |
