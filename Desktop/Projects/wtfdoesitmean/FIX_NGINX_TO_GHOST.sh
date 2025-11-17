#!/bin/bash

# Script to fix Nginx to route to Ghost instead of Next.js

echo "🔧 Updating Nginx to route to Ghost..."

# Backup current config
sudo cp /etc/nginx/sites-available/wtfdoesitmean /etc/nginx/sites-available/wtfdoesitmean.backup

# Create new config that routes to Ghost
sudo tee /etc/nginx/sites-available/wtfdoesitmean > /dev/null <<'EOF'
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

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
EOF

# Test config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is valid, reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Done! Site should now route to Ghost on port 2368"
else
    echo "❌ Config has errors, check above"
    exit 1
fi

echo ""
echo "📋 Verify:"
echo "1. Check Ghost is running: sudo -i -u ghost-mgr && ghost status"
echo "2. Visit: http://wtfdoesitmean.com"

