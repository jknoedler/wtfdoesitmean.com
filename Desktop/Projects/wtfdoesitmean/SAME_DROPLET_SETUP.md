# Running Ghost CMS and Next.js on the Same Droplet

Yes! You can absolutely run both Ghost CMS and your Next.js site on the same Digital Ocean droplet. This is a common and cost-effective setup.

## Architecture Overview

```
Digital Ocean Droplet
├── Ghost CMS (Port 2368) → https://cms.wtfdoesitmean.com
└── Next.js App (Port 3000) → https://wtfdoesitmean.com
```

## Setup Steps

### 1. Install Ghost CMS

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Ghost CLI
npm install -g ghost-cli@latest

# Install Ghost
mkdir -p /var/www/ghost
cd /var/www/ghost
ghost install
```

When prompted:
- **Blog URL**: `https://cms.wtfdoesitmean.com` (or use a subdomain for Ghost admin)
- Complete the setup wizard

### 2. Configure Nginx for Ghost

Ghost will set up Nginx automatically. It will be available at your configured domain.

### 3. Deploy Your Next.js Site

```bash
# On your droplet, create directory for Next.js app
mkdir -p /var/www/wtfdoesitmean
cd /var/www/wtfdoesitmean

# Clone or upload your Next.js project
# (Upload your project files here)

# Install dependencies
npm install

# Build the app
npm run build
```

### 4. Configure Nginx for Next.js

Edit Nginx configuration:

```bash
nano /etc/nginx/sites-available/wtfdoesitmean
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

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
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/wtfdoesitmean /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. Set Up SSL for Both Sites

```bash
# Install Certbot
apt-get update
apt-get install certbot python3-certbot-nginx -y

# Get SSL for Next.js site
certbot --nginx -d wtfdoesitmean.com -d www.wtfdoesitmean.com

# Get SSL for Ghost CMS (if using subdomain)
certbot --nginx -d cms.wtfdoesitmean.com
```

### 6. Run Next.js with PM2

```bash
# Install PM2
npm install -g pm2

# Start your Next.js app
cd /var/www/wtfdoesitmean
pm2 start npm --name "wtfdoesitmean" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 7. Update Environment Variables

Create `.env.production` in your Next.js app:

```env
GHOST_URL=https://cms.wtfdoesitmean.com
GHOST_CONTENT_API_KEY=your-content-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
NODE_ENV=production
```

## Alternative: Use Different Ports

If you want both on the same domain with different paths:

### Option A: Ghost on Subdomain (Recommended)
- Ghost: `https://cms.wtfdoesitmean.com`
- Next.js: `https://wtfdoesitmean.com`

### Option B: Ghost on Subdirectory
- Ghost: `https://wtfdoesitmean.com/ghost` (admin only)
- Next.js: `https://wtfdoesitmean.com` (main site)

## DNS Configuration

Point both domains to your droplet IP:

```
A Record: wtfdoesitmean.com → your-droplet-ip
A Record: cms.wtfdoesitmean.com → your-droplet-ip
```

## Resource Requirements

Minimum recommended droplet:
- **2GB RAM** (can work with 1GB but may be tight)
- **1 vCPU**
- **25GB SSD**

For better performance:
- **4GB RAM**
- **2 vCPU**
- **50GB SSD**

## Monitoring

Check both services:

```bash
# Check Ghost
ghost status

# Check Next.js (PM2)
pm2 status
pm2 logs wtfdoesitmean

# Check Nginx
systemctl status nginx
```

## Benefits of Same Droplet

✅ Cost-effective (one server)
✅ Easier to manage
✅ Lower latency between services
✅ Simpler deployment

## Troubleshooting

### Port Conflicts
- Ghost uses port 2368
- Next.js uses port 3000
- Nginx handles routing

### Memory Issues
If you run out of memory:
```bash
# Check memory usage
free -h

# Restart services
ghost restart
pm2 restart wtfdoesitmean
```

### Update Next.js App
```bash
cd /var/www/wtfdoesitmean
git pull  # or upload new files
npm install
npm run build
pm2 restart wtfdoesitmean
```

