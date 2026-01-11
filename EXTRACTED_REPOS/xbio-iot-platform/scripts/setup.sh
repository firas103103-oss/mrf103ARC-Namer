#!/bin/bash
echo "🚀 Setting up XBio IoT Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env from example
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✅ .env file created"
else
  echo "ℹ️  .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env with your credentials:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - OPENAI_API_KEY (for AI features)"
echo "2. Setup database:"
echo "   psql -U postgres -f database/schema.sql"
echo "3. Run development server:"
echo "   npm run dev"
echo ""
