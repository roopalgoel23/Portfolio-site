# 🚀 Deployment Guide — Makeup by Roopal Goel

> **Repo:** https://github.com/roopalgoel23/Portfolio-site.git
> **Target:** Hostinger KVM VPS (Ubuntu) + MongoDB Atlas
> **Cost:** ~₹350/month total

---

## 📋 Checklist Before Starting

- [ ] Hostinger VPS purchased (KVM 1, Ubuntu, India/Mumbai)
- [ ] VPS IP address & root password noted
- [ ] Domain pointed to VPS (A records set)
- [ ] GitHub repo ready: `https://github.com/roopalgoel23/Portfolio-site.git`

---

## Step 1 — Buy the Right VPS

1. Log into **Hostinger → VPS Hosting**
2. Choose **KVM 1** plan (1 vCPU, 4GB RAM, 50GB NVMe SSD)
3. Set **Location: India (Mumbai)**
4. Set **OS: Ubuntu 22.04 or 24.04**
5. Set **Template: Clean OS** (no control panel)
6. Complete purchase

After purchase, go to **VPS Dashboard** and note:
- **IP Address** (e.g., `82.xxx.xxx.xxx`)
- **Root Password** (or create SSH key)

---

## Step 2 — Point Domain to VPS

Go to **Hostinger → hPanel → Domains → [your domain] → DNS / Nameservers**

Add two **A records**:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | `@` | `YOUR_VPS_IP` | Default |
| A | `www` | `YOUR_VPS_IP` | Default |

> ⏱ DNS takes 5–30 minutes. Verify at https://dnschecker.org

---

## Step 3 — SSH into Your VPS

From your computer, open PowerShell:

```bash
ssh root@YOUR_VPS_IP
```

Enter the root password when prompted.

> **If SSH is blocked**, use the **Browser Terminal** button in Hostinger's VPS dashboard.

---

## Step 4 — Clone Your Code

```bash
cd /var/www
git clone https://github.com/roopalgoel23/Portfolio-site.git roopal
cd roopal
```

> If the repo is **private**, use a GitHub Personal Access Token:
> GitHub → Settings → Developer Settings → Personal Access Tokens → Generate → check "repo" scope

---

## Step 5 — Run One-Time Server Setup

```bash
bash deploy/setup-server.sh
```

This installs automatically:
- ✅ Node.js 20
- ✅ PM2 (process manager)
- ✅ Nginx (reverse proxy)
- ✅ Certbot (SSL certificates)

---

## Step 6 — Create Production `.env`

```bash
nano /var/www/roopal/server/.env
```

Paste the following — replace `YOUR_DOMAIN` with your actual domain:

```env
PORT=5000
NODE_ENV=production

# CORS — your domain only
CORS_ORIGINS=https://YOUR_DOMAIN.com,https://www.YOUR_DOMAIN.com

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://makeupbyroopalgoel_db_user:kBJrD1fpi4bNdGCe@portfoliosite.c0qvnnt.mongodb.net/makeup_roopal_goel?retryWrites=true&w=majority

# JWT
JWT_SECRET=Ljvm80kK0Dwq6dmsKt8vfmbLqEGoRTTvyxatNRHJwkVYKRLJnUJhby2W6aEGxVBY
JWT_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=Makeupbyroopalgoel@gmail.com
ADMIN_PASSWORD=Champpoonam23.

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=Makeupbyroopalgoel@gmail.com
SMTP_PASS=dbjk ugte tqim ztny

# Contact
CONTACT_TO_EMAIL=Makeupbyroopalgoel@gmail.com
CONTACT_FROM_NAME=Portfolio Enquiry
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## Step 7 — Deploy the App

```bash
cd /var/www/roopal
bash deploy/deploy.sh
```

This will:
- Install all dependencies (server + client)
- Build the React frontend
- Start the server with PM2

Verify it's running:
```bash
pm2 status
curl http://localhost:5000/api/health
```

You should see: `{"status":"ok","timestamp":"..."}`

---

## Step 8 — Configure Nginx

```bash
# Copy the Nginx config
cp /var/www/roopal/deploy/nginx.conf /etc/nginx/sites-available/roopal

# Edit it — replace YOUR_DOMAIN with your actual domain
nano /etc/nginx/sites-available/roopal

# Enable the site
ln -s /etc/nginx/sites-available/roopal /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

Site should now be live at `http://YOUR_DOMAIN`!

---

## Step 9 — Enable SSL (HTTPS)

```bash
certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
```

Follow the prompts:
1. Enter your email
2. Agree to terms
3. Choose **redirect HTTP → HTTPS** (recommended)

Your site is now at **`https://YOUR_DOMAIN.com`** ✅

---

## Step 10 — Allow VPS IP in MongoDB Atlas

1. Go to **MongoDB Atlas → Network Access**
2. Click **Add IP Address**
3. Either:
   - Add `0.0.0.0/0` (allow from anywhere — easiest)
   - Or add your specific VPS IP (more secure)

---

## Step 11 — Test Everything

- [ ] Visit `https://YOUR_DOMAIN.com` — site loads
- [ ] Test the contact form — check email for enquiry
- [ ] Go to `/admin/login` — admin panel works
- [ ] Upload a test image in admin — verify it appears

---

## 🔄 Updating the Site Later

When you make changes locally and push to GitHub:

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Pull and redeploy
cd /var/www/roopal
git pull
npm run deploy:restart
```

Or one-liner:
```bash
cd /var/www/roopal && git pull && npm run deploy:restart
```

---

## 🛠 Useful Commands

```bash
# Check server status
pm2 status

# View server logs (real-time)
pm2 logs makeup-roopal

# Restart server
pm2 restart makeup-roopal

# Stop server
pm2 stop makeup-roopal

# Restart Nginx
systemctl restart nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check SSL certificate status
certbot certificates

# Check disk space
df -h

# Check memory usage
free -m
```

---

## 🧱 Architecture

```
Visitor's Browser
       ↓
   HTTPS (443)
       ↓
    Nginx ←── SSL Certificate (Let's Encrypt)
       ↓
  Node.js :5000 (PM2 managed)
       ├── /api/*         → API routes
       ├── /uploads/*     → Uploaded images
       └── /*             → React build (client/dist)
       ↓
  MongoDB Atlas (cloud)
```

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Hostinger KVM 1 | ~₹350/month |
| Domain (Year 1) | FREE with Hostinger |
| Domain (Year 2+) | ~₹1,000/year |
| MongoDB Atlas | FREE (512MB tier) |
| SSL Certificate | FREE (Let's Encrypt) |
| **Total** | **~₹350/month** |

---

## 🆘 Troubleshooting

### Site shows "502 Bad Gateway"
```bash
pm2 status              # Is the app running?
pm2 restart makeup-roopal
pm2 logs makeup-roopal  # Check for errors
```

### Images not loading
```bash
# Check uploads directory
ls -la /var/www/roopal/server/uploads/

# Check Nginx is serving uploads
curl -I http://localhost:5000/uploads/test.jpg
```

### Email not sending
```bash
# Check server logs for email errors
pm2 logs makeup-roopal | grep -i mail
```

### MongoDB connection error
```bash
# Verify the connection string in .env
cat /var/www/roopal/server/.env | grep MONGODB

# Test connection
mongosh "mongodb+srv://..." --eval "db.runCommand({ping:1})"
```

### Nginx config error
```bash
nginx -t                        # Test config
systemctl status nginx          # Check Nginx status
tail -f /var/log/nginx/error.log # View errors
```

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
