# Step-by-Step Deployment Guide

Follow these commands **in order**. Run them from your Mac terminal.

## Step 1: Upload Your Project to the Droplet

```bash
cd ~/Desktop/Projects/wtfdoesitmean

# Upload everything (excluding node_modules and .next)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@137.184.116.32:/var/www/wtfdoesitmean/
```

**Alternative if rsync doesn't work:**
```bash
# Create a tarball
cd ~/Desktop/Projects/wtfdoesitmean
tar --exclude='node_modules' --exclude='.next' --exclude='.git' \
  -czf /tmp/wtfdoesitmean.tar.gz .

# Upload it
scp /tmp/wtfdoesitmean.tar.gz root@137.184.116.32:/tmp/

# Then SSH in and extract (see Step 2)
```

---

## Step 2: SSH into Your Droplet

```bash
ssh root@137.184.116.32
```

---

## Step 3: Set Up the Project Directory

```bash
# Create the directory if it doesn't exist
mkdir -p /var/www/wtfdoesitmean
cd /var/www/wtfdoesitmean

# If you used the tarball method, extract it:
# tar -xzf /tmp/wtfdoesitmean.tar.gz -C /var/www/wtfdoesitmean
```

---

## Step 4: Install Dependencies

```bash
cd /var/www/wtfdoesitmean
npm install --production
```

---

## Step 5: Create Production Environment File

```bash
nano .env.production
```

**Paste this content** (replace with your actual Ghost API key):
```
GHOST_URL=http://137.184.116.32:2368
GHOST_CONTENT_API_KEY=paste-your-actual-ghost-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
NODE_ENV=production
```

**To get your Ghost API key:**
1. Go to `http://137.184.116.32:2368/ghost`
2. Settings → Integrations → Add custom integration
3. Copy the Content API key

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

---

## Step 6: Build the Next.js App

```bash
cd /var/www/wtfdoesitmean
npm run build
```

This will take 1-2 minutes. Wait for it to finish.

---

## Step 7: Configure Nginx

```bash
# Edit the Nginx config
nano /etc/nginx/sites-available/wtfdoesitmean
```

**Delete everything in the file and paste this:**

```nginx
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

    # Main Next.js site (your blog)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Ghost admin (hidden, only for you to post)
    location /ghost {
        proxy_pass http://localhost:2368;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

**Test and reload Nginx:**
```bash
nginx -t
systemctl reload nginx
```

---

## Step 8: Install and Start PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start your Next.js app
cd /var/www/wtfdoesitmean
pm2 start npm --name "wtfdoesitmean" -- start

# Save PM2 config (so it restarts on reboot)
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**Copy and run the command it gives you** (it will look like `sudo env PATH=... pm2 startup systemd -u root --hp /root`)

---

## Step 9: Verify Everything Works

```bash
# Check if Next.js is running
pm2 status

# Check Next.js logs
pm2 logs wtfdoesitmean

# Check Nginx
systemctl status nginx
```

---

## Step 10: Test Your Site

1. **Visit your site:** `http://wtfdoesitmean.com` (or `https://` if you set up SSL)
   - You should see your Next.js site with the gothic theme
   - Infinite scroll should work
   - Only "Scroll to Top" and "Random Post" buttons

2. **Visit Ghost admin:** `http://wtfdoesitmean.com/ghost`
   - Login and create posts here
   - Posts will appear on your main site automatically

---

## Troubleshooting

**If Next.js isn't running:**
```bash
pm2 restart wtfdoesitmean
pm2 logs wtfdoesitmean
```

**If you see errors, check:**
```bash
# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check if Ghost is running
ghost status
```

**To update your site after making changes:**
```bash
cd /var/www/wtfdoesitmean
git pull  # if using git
# OR upload new files
npm run build
pm2 restart wtfdoesitmean
```

---

## Optional: Set Up SSL (HTTPS)

```bash
apt-get update
apt-get install certbot python3-certbot-nginx -y
certbot --nginx -d wtfdoesitmean.com -d www.wtfdoesitmean.com
```

This will automatically configure HTTPS for your site.

