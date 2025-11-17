#!/bin/bash

# Ghost CMS Installation Script for Digital Ocean
# Run this script on your Digital Ocean droplet as root

set -e

echo "🚀 Starting Ghost CMS installation..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js (Ghost requires Node.js 18+)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install MySQL
echo "📦 Installing MySQL..."
apt-get install -y mysql-server

# Secure MySQL installation
echo "🔒 Securing MySQL..."
mysql_secure_installation <<EOF

y
your_mysql_root_password
your_mysql_root_password
y
y
y
y
EOF

# Install Nginx
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Install Ghost CLI
echo "📦 Installing Ghost CLI..."
npm install -g ghost-cli@latest

# Create Ghost directory
echo "📁 Creating Ghost directory..."
mkdir -p /var/www/ghost
chown -R $USER:$USER /var/www/ghost
chmod 775 /var/www/ghost

# Navigate to Ghost directory
cd /var/www/ghost

# Install Ghost
echo "👻 Installing Ghost CMS..."
ghost install --no-setup

echo "✅ Ghost installation complete!"
echo ""
echo "Next steps:"
echo "1. Run: ghost setup"
echo "2. Follow the setup wizard"
echo "3. Visit: https://your-domain.com/ghost"
echo "4. Create your admin account"
echo "5. Get your Content API key from Settings → Integrations"

