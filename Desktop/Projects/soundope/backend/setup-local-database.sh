#!/bin/bash

# Script to set up PostgreSQL database locally on macOS

echo "🔧 Local PostgreSQL Database Setup"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Installing PostgreSQL via Homebrew..."
    echo "This will install PostgreSQL and start it as a service."
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Install PostgreSQL
    brew install postgresql@16
    
    # Start PostgreSQL service
    brew services start postgresql@16
    
    echo ""
    echo "✅ PostgreSQL installed and started!"
    echo ""
    echo "Waiting 5 seconds for PostgreSQL to initialize..."
    sleep 5
else
    echo "✅ PostgreSQL is already installed"
    
    # Check if PostgreSQL is running
    if ! pg_isready &> /dev/null; then
        echo "Starting PostgreSQL service..."
        brew services start postgresql@16 2>/dev/null || brew services start postgresql@15 2>/dev/null || brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
        sleep 3
    fi
fi

echo ""
echo "Setting up database..."

# Default values
DB_NAME="soundope"
DB_USER="${USER}"  # Use current macOS user
DB_PASSWORD=""     # No password for local development

# Create database if it doesn't exist
echo "Creating database '$DB_NAME'..."
createdb $DB_NAME 2>/dev/null || echo "Database '$DB_NAME' already exists or createdb failed"

# Run the schema
echo ""
echo "Running database schema..."
if [ -f "database/schema.sql" ]; then
    psql -d $DB_NAME -f database/schema.sql
    if [ $? -eq 0 ]; then
        echo "✅ Database schema created successfully!"
    else
        echo "❌ Error running schema. You may need to run it manually:"
        echo "   psql -d $DB_NAME -f database/schema.sql"
    fi
else
    echo "❌ Schema file not found at database/schema.sql"
fi

# Update .env file
echo ""
echo "Updating .env file..."
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=dev-secret-key-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

echo "✅ .env file updated with local database settings!"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: (none for local development)"
echo ""
echo "✅ Setup complete! Restart your backend server to connect."



