#!/bin/bash

echo "🔧 Fixing SSL config to route to Ghost..."

# Backup
sudo cp /etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf /etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf.backup

# Check current SSL config
echo "Current SSL config:"
cat /etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf | grep -A 5 "proxy_pass"

echo ""
echo "Updating to route to Ghost (port 2368)..."

# This will need to be edited manually since we don't know the full SSL config structure
echo ""
echo "⚠️  You need to edit the SSL config file manually:"
echo "   sudo nano /etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf"
echo ""
echo "Find the line that says:"
echo "   proxy_pass http://localhost:3000;"
echo ""
echo "Change it to:"
echo "   proxy_pass http://localhost:2368;"
echo ""
echo "Then run:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"

