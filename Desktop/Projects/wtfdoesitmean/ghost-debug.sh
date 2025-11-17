#!/bin/bash
# Ghost Debugging Script
# Run this on your droplet to diagnose Ghost startup issues

echo "=== Ghost Service Status ==="
systemctl status ghost_129-212-179-219 --no-pager -l

echo -e "\n=== Recent Ghost Logs ==="
journalctl -u ghost_129-212-179-219 -n 50 --no-pager

echo -e "\n=== Checking Port 2368 ==="
netstat -tulpn | grep 2368 || echo "Port 2368 is not in use"

echo -e "\n=== Checking Ghost Process ==="
ps aux | grep ghost | grep -v grep || echo "No Ghost process running"

echo -e "\n=== Checking Ghost Directory Permissions ==="
ls -la /var/www/ghost/ | head -10

echo -e "\n=== Checking Ghost Config ==="
if [ -f /var/www/ghost/config.production.json ]; then
    echo "Config file exists"
    cat /var/www/ghost/config.production.json | grep -E "(url|database|mail)" | head -10
else
    echo "Config file not found!"
fi

echo -e "\n=== Checking MySQL/MariaDB ==="
systemctl status mysql --no-pager -l 2>/dev/null || systemctl status mariadb --no-pager -l 2>/dev/null || echo "Database service check failed"

echo -e "\n=== Memory Check ==="
free -h

echo -e "\n=== Disk Space ==="
df -h /var/www/ghost





