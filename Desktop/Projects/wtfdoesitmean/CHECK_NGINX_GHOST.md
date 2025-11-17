# Check Nginx and Ghost Status

Run these commands on the server to diagnose:

```bash
# 1. Check current Nginx config
cat /etc/nginx/sites-available/wtfdoesitmean

# 2. Check what's actually enabled
ls -la /etc/nginx/sites-enabled/

# 3. Check if Ghost is running
sudo -i -u ghost-mgr
ghost status
exit

# 4. Check what's listening on port 2368 (Ghost)
sudo lsof -i:2368 || sudo netstat -tulpn | grep 2368

# 5. Check what's listening on port 3000 (Next.js)
sudo lsof -i:3000 || sudo netstat -tulpn | grep 3000

# 6. Test Nginx config
sudo nginx -t

# 7. Check Nginx status
sudo systemctl status nginx
```

## If Nginx is routing to Next.js instead of Ghost:

The config should have:
```nginx
proxy_pass http://localhost:2368;  # Ghost
```

NOT:
```nginx
proxy_pass http://localhost:3000;  # Next.js
```

## To fix:

```bash
sudo nano /etc/nginx/sites-available/wtfdoesitmean
```

Make sure the `location /` block has:
```nginx
proxy_pass http://localhost:2368;
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

