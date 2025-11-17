#!/bin/bash

# Quick Ghost Setup - Run this after ghost install

echo "👻 Ghost CMS Quick Setup"
echo "========================"
echo ""

# Check if Ghost is installed
if ! command -v ghost &> /dev/null; then
    echo "❌ Ghost CLI not found. Please install it first:"
    echo "   npm install -g ghost-cli@latest"
    exit 1
fi

# Navigate to Ghost directory
if [ ! -d "/var/www/ghost" ]; then
    echo "📁 Creating Ghost directory..."
    mkdir -p /var/www/ghost
    cd /var/www/ghost
    echo "📦 Installing Ghost..."
    ghost install
else
    cd /var/www/ghost
    echo "✅ Ghost directory found"
fi

echo ""
echo "🔧 Running Ghost setup..."
ghost setup

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit: https://your-domain.com/ghost"
echo "2. Create your admin account"
echo "3. Go to Settings → Integrations"
echo "4. Create a Custom Integration"
echo "5. Copy the Content API Key"
echo "6. Add it to your .env.local file"

