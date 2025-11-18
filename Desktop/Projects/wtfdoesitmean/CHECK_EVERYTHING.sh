#!/bin/bash

echo "=========================================="
echo "DIAGNOSING NGINX AND GHOST SETUP"
echo "=========================================="
echo ""

echo "1. CHECKING GHOST STATUS:"
echo "---"
sudo -i -u ghost-mgr bash -c "ghost status" 2>&1
echo ""

echo "2. CHECKING IF GHOST IS LISTENING ON PORT 2368:"
echo "---"
sudo lsof -i:2368 2>&1 || echo "Nothing found on port 2368"
echo ""

echo "3. TESTING GHOST DIRECTLY:"
echo "---"
curl -I http://localhost:2368 2>&1 | head -10
echo ""

echo "4. CHECKING NGINX CONFIGS ENABLED:"
echo "---"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "5. CHECKING MAIN CONFIG (wtfdoesitmean):"
echo "---"
cat /etc/nginx/sites-available/wtfdoesitmean 2>&1
echo ""

echo "6. CHECKING SSL CONFIG:"
echo "---"
cat /etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf 2>&1 | head -30
echo ""

echo "7. CHECKING WHAT NGINX IS ACTUALLY SERVING:"
echo "---"
sudo nginx -T 2>&1 | grep -A 20 "server_name.*wtfdoesitmean" | head -40
echo ""

echo "8. CHECKING NGINX STATUS:"
echo "---"
sudo systemctl status nginx --no-pager | head -15
echo ""

echo "=========================================="
echo "DONE"
echo "=========================================="

