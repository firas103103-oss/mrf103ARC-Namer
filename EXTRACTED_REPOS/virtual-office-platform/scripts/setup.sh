#!/bin/bash

echo "🚀 Setting up Virtual Office Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/cloning/voices uploads/cloning/photos uploads/cloning/documents

if [ $? -ne 0 ]; then
    echo "❌ Failed to create upload directories"
    exit 1
fi

echo "✅ Upload directories created"
echo ""

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your configuration:"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - SESSION_SECRET: Generate a secure random string"
    echo "   - PASSCODE: Set your custom passcode (default: passcodemrf1Q@)"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL detected"
    echo ""
    echo "📊 Next steps for database setup:"
    echo "   1. Create database: createdb virtual_office"
    echo "   2. Run migrations: psql -d virtual_office -f database/schema.sql"
    echo "   Or use Drizzle: npm run db:push"
    echo ""
else
    echo "⚠️  PostgreSQL not detected. Make sure PostgreSQL is installed and running."
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📚 Quick Start:"
echo "   1. Edit .env with your database credentials"
echo "   2. Setup database (see above)"
echo "   3. Run: npm run dev"
echo "   4. Open: http://localhost:3000"
echo ""
echo "🔐 Default Passcode: passcodemrf1Q@"
echo ""
echo "📖 Documentation:"
echo "   - Quick Start: docs/QUICK_START.md"
echo "   - API Reference: docs/API_REFERENCE.md"
echo "   - Deployment: docs/DEPLOYMENT.md"
echo ""
