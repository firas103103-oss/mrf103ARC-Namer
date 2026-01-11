#!/bin/bash
echo "🚀 Setting up Virtual Office Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file"
  echo "⚠️  Please edit .env with your credentials"
else
  echo "✅ .env file already exists"
fi

# Create upload directories
echo "📁 Creating upload directories..."
bash scripts/create-upload-dirs.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Run: npm run db:push"
echo "3. Run: npm run dev"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:5000"
