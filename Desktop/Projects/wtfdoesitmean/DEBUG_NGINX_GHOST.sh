#!/bin/bash

echo "🔍 Diagnosing Nginx and Ghost setup..."
echo ""

echo "1. Checking for all Nginx config files:"
echo "--- Sites available ---"
ls -la /etc/nginx/sites-available/
echo ""
echo "--- Sites enabled ---"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "2. Checking what's listening on ports:"
echo "--- Port 2368 (Ghost) ---"
sudo lsof -i:2368 2>/dev/null || echo "Nothing on port 2368"
echo ""
echo "--- Port 3000 (Next.js) ---"
sudo lsof -i:3000 2>/dev/null || echo "Nothing on port 3000"
echo ""

echo "3. Checking Ghost status:"
sudo -i -u ghost-mgr bash -c "ghost status" 2>&1
echo ""

echo "4. Checking all enabled Nginx configs:"
for file in /etc/nginx/sites-enabled/*; do
    echo "--- $file ---"
    cat "$file" 2>/dev/null | grep -E "server_name|proxy_pass|listen" || echo "Empty or can't read"
    echo ""
done

echo "5. Testing what's actually being served:"
curl -s -I http://localhost:2368 | head -5
echo ""
curl -s -I http://localhost:3000 | head -5

