#!/bin/bash
echo "🚀 Setting up Virtual Office Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/voice uploads/photos uploads/documents

# Add .gitkeep files
touch uploads/voice/.gitkeep
touch uploads/photos/.gitkeep
touch uploads/documents/.gitkeep

# Copy environment file
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "⚠️  Please edit .env with your database credentials"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Run 'npm run db:push' to setup database"
echo "3. Run 'npm run dev' to start development server"
echo ""
