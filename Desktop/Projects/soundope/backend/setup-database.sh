#!/bin/bash

# Script to help set up DigitalOcean PostgreSQL database connection
# Run this after creating your database on DigitalOcean

echo "🔧 DigitalOcean Database Setup"
echo ""
echo "Please provide your database connection details:"
echo ""

read -p "Database Host (e.g., db-postgresql-nyc3-12345.db.ondigitalocean.com): " DB_HOST
read -p "Database Port (usually 25060 for DigitalOcean): " DB_PORT
read -p "Database Name (e.g., defaultdb or soundope): " DB_NAME
read -p "Database User (e.g., doadmin): " DB_USER
read -sp "Database Password: " DB_PASSWORD
echo ""

# Update .env file
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (DigitalOcean PostgreSQL)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=dev-secret-key-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

echo ""
echo "✅ .env file updated!"
echo ""
echo "Next steps:"
echo "1. Run the database schema:"
echo "   psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f database/schema.sql"
echo ""
echo "2. Or use the connection string from DigitalOcean dashboard"
echo "   (it will prompt for password)"
echo ""
echo "3. Restart your backend server to connect to the new database"



