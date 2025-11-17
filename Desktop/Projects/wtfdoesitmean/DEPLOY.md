# Deploy Next.js Site to Digital Ocean

## Quick Deploy Steps

### 1. Upload Your Project to the Droplet

From your Mac, run:

```bash
cd ~/Desktop/Projects/wtfdoesitmean
scp -r . root@137.184.116.32:/var/www/wtfdoesitmean
```

### 2. SSH into Your Droplet

```bash
ssh root@137.184.116.32
```

### 3. Set Up the Next.js App

```bash
cd /var/www/wtfdoesitmean

# Install dependencies
npm install --production

# Create production environment file
nano .env.production
```

Add this content:
```
GHOST_URL=http://137.184.116.32:2368
GHOST_CONTENT_API_KEY=your-actual-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter)

### 4. Build the App

```bash
npm run build
```

### 5. Configure Nginx for Next.js

```bash
nano /etc/nginx/sites-available/wtfdoesitmean
```

Replace the entire file with:

```nginx
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

    # Main Next.js site
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

    # Ghost admin (hidden, only for you)
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

Test and reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

### 6. Start Next.js with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
cd /var/www/wtfdoesitmean
pm2 start npm --name "wtfdoesitmean" -- start

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 7. Set Up SSL (Optional but Recommended)

```bash
apt-get update
apt-get install certbot python3-certbot-nginx -y
certbot --nginx -d wtfdoesitmean.com -d www.wtfdoesitmean.com
```

## Verify It's Working

1. Visit `https://wtfdoesitmean.com` - you should see your Next.js site (gothic theme, infinite scroll)
2. Visit `https://wtfdoesitmean.com/ghost` - Ghost admin (for posting)

## Troubleshooting

- Check if Next.js is running: `pm2 status`
- Check Next.js logs: `pm2 logs wtfdoesitmean`
- Check Nginx: `systemctl status nginx`
- Restart Next.js: `pm2 restart wtfdoesitmean`

