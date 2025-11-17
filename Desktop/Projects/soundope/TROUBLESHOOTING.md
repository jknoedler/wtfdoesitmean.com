# Troubleshooting 500 Error

Run these commands on your server to diagnose the issue:

## Step 1: Check Nginx Error Logs
```bash
tail -n 50 /var/log/nginx/error.log
```

## Step 2: Check if Frontend Files Exist
```bash
ls -la /var/www/soundope/dist/
```

## Step 3: Check File Permissions
```bash
chown -R www-data:www-data /var/www/soundope/dist
chmod -R 755 /var/www/soundope/dist
```

## Step 4: Check if Backend is Running
```bash
pm2 list
pm2 logs soundope-api --lines 50
```

If backend isn't running:
```bash
cd /var/www/soundope/backend
pm2 start server.js --name soundope-api
pm2 save
```

## Step 5: Test Backend Directly
```bash
curl http://localhost:3000/health
```

## Step 6: Check Nginx Config
```bash
cat /etc/nginx/sites-available/soundope
nginx -t
```

## Step 7: Rebuild Frontend with Correct API URL
```bash
cd /var/www/soundope
echo "VITE_API_URL=https://soundope.com/api" > .env
npm run build
```

## Step 8: Restart Services
```bash
systemctl reload nginx
pm2 restart soundope-api
```

