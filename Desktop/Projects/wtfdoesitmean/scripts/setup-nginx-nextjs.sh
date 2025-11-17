#!/bin/bash

# Nginx Configuration for Next.js on Same Droplet as Ghost
# Run this after Ghost is installed

DOMAIN="wtfdoesitmean.com"
APP_PORT=3000

echo "🔧 Setting up Nginx for Next.js..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/wtfdoesitmean <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/wtfdoesitmean /etc/nginx/sites-enabled/

# Test configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Set up SSL: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "2. Deploy your Next.js app to /var/www/wtfdoesitmean"
echo "3. Start with PM2: pm2 start npm --name 'wtfdoesitmean' -- start"

