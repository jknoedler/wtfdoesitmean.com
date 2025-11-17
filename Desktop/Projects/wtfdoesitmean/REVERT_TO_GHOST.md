# Revert to Ghost CMS as Main Site

This will make Ghost CMS serve the main website at wtfdoesitmean.com instead of Next.js.

## On the Server:

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/wtfdoesitmean
```

**Replace the entire file with this:**

```nginx
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

    # Main Ghost site (serves the blog)
    location / {
        proxy_pass http://localhost:2368;
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

**Save:** `Ctrl+X`, `Y`, `Enter`

**Test and reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Verify Ghost is running:**
```bash
# Check Ghost status
sudo -i -u ghost-mgr
ghost status
exit
```

**Optional - Stop Next.js (if you don't need it):**
```bash
pm2 stop wtfdoesitmean
pm2 delete wtfdoesitmean
```

## Result:

- **Main site (wtfdoesitmean.com):** Now served by Ghost CMS
- **Ghost admin:** Accessible at wtfdoesitmean.com/ghost
- **Next.js:** Stopped (or can run on a different port if needed)

Visit `http://wtfdoesitmean.com` and you should see your Ghost blog!

