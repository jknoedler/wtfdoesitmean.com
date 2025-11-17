#!/bin/bash

# Deploy Next.js App to Droplet
# Run this from your local machine or on the droplet

APP_DIR="/var/www/wtfdoesitmean"
DOMAIN="wtfdoesitmean.com"

echo "🚀 Deploying Next.js app..."

# Check if running on droplet or locally
if [ -f "/etc/nginx/sites-available/ghost" ]; then
    echo "✅ Running on droplet"
    DEPLOY_LOCALLY=true
else
    echo "📤 You'll need to upload files to your droplet"
    echo "   Option 1: Use SCP"
    echo "   Option 2: Use Git and clone on droplet"
    DEPLOY_LOCALLY=false
fi

if [ "$DEPLOY_LOCALLY" = true ]; then
    # Create app directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🔨 Building app..."
    npm run build
    
    echo "✅ Build complete!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Create .env.production with your Ghost credentials"
    echo "2. Start with PM2: pm2 start npm --name 'wtfdoesitmean' -- start"
    echo "3. Save PM2: pm2 save"
else
    echo ""
    echo "📤 To deploy from local machine:"
    echo ""
    echo "1. Build locally:"
    echo "   npm run build"
    echo ""
    echo "2. Upload to droplet:"
    echo "   scp -r . root@your-droplet-ip:/var/www/wtfdoesitmean"
    echo ""
    echo "3. SSH into droplet and run:"
    echo "   cd /var/www/wtfdoesitmean"
    echo "   npm install --production"
    echo "   pm2 start npm --name 'wtfdoesitmean' -- start"
fi

