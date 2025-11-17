#!/bin/bash
# Complete deployment script to fix and deploy to server
# This script will help you deploy the correct files to the Soundope server

set -e

SERVER="root@129.212.186.215"
SERVER_PATH="/var/www/soundope"

echo "🚀 Soundope Deployment Script"
echo "=============================="
echo ""

# Step 1: Verify local build works
echo "📦 Step 1: Building locally to verify files are correct..."
if npm run build > /tmp/local-build.log 2>&1; then
    echo "✅ Local build successful!"
else
    echo "❌ Local build failed! Check /tmp/local-build.log"
    exit 1
fi

echo ""
echo "📋 Deployment Instructions:"
echo "=========================="
echo ""
echo "Since direct SSH/SCP isn't working, please run these commands on your server:"
echo ""
echo "1. SSH into the server:"
echo "   ssh root@129.212.186.215"
echo ""
echo "2. Once on the server, run these commands:"
echo ""
echo "   cd /var/www/soundope"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo "   npm install"
echo "   npm run build"
echo "   chown -R www-data:www-data dist/"
echo "   chmod -R 755 dist/"
echo "   cd backend"
echo "   pm2 restart soundope-api"
echo "   pm2 save"
echo ""
echo "OR if git still doesn't work, the files need to be manually copied."
echo ""
echo "The correct files are in your local repository at:"
echo "  - src/pages/Layout.jsx (1752 lines)"
echo "  - src/pages/Dashboard.jsx (332 lines)"
echo "  - src/pages/SpotifyPlaylists.jsx (514 lines)"
echo ""

