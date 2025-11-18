#!/bin/bash

echo "🔧 Adding location / block to SSL config..."

# Read the current SSL config
SSL_CONFIG="/etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf"

# Backup
sudo cp "$SSL_CONFIG" "$SSL_CONFIG.backup2"

# Check if location / already exists
if grep -q "location / {" "$SSL_CONFIG"; then
    echo "⚠️  location / already exists, checking if it routes to Ghost..."
    grep -A 5 "location / {" "$SSL_CONFIG" | grep "proxy_pass"
else
    echo "✅ Adding location / block..."
    
    # Find the line with "listen 443" and add location / block after the SSL cert lines
    # This is a bit complex, so we'll use a Python script or sed
    
    # Create a temp file with the fix
    sudo python3 << 'PYTHON_SCRIPT'
import re

config_path = "/etc/nginx/sites-available/www.wtfdoesitmean.com-ssl.conf"

with open(config_path, 'r') as f:
    content = f.read()

# Check if location / already exists in the 443 server block
if 'location / {' in content and 'listen 443' in content:
    # Check if it's in the right place (after listen 443 block)
    lines = content.split('\n')
    in_443_block = False
    has_location_root = False
    
    for i, line in enumerate(lines):
        if 'listen 443' in line:
            in_443_block = True
        if in_443_block and 'location / {' in line:
            has_location_root = True
            break
        if in_443_block and '}' in line and 'server {' not in line:
            # End of server block
            break
    
    if not has_location_root:
        # Find where to insert location / block (after ssl_certificate_key, before location /ghost)
        new_content = content.replace(
            '    location /ghost {',
            '''    location / {
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

    location /ghost {'''
        )
        
        with open(config_path, 'w') as f:
            f.write(new_content)
        print("✅ Added location / block to SSL config")
    else:
        print("⚠️  location / already exists")
else:
    # Need to add it
    new_content = content.replace(
        '    location /ghost {',
        '''    location / {
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

    location /ghost {'''
    )
    
    with open(config_path, 'w') as f:
        f.write(new_content)
    print("✅ Added location / block to SSL config")
PYTHON_SCRIPT

fi

echo ""
echo "🧪 Testing config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config is valid, reloading..."
    sudo systemctl reload nginx
    echo "✅ Done!"
else
    echo "❌ Config has errors"
    echo "Restoring backup..."
    sudo cp "$SSL_CONFIG.backup2" "$SSL_CONFIG"
fi

