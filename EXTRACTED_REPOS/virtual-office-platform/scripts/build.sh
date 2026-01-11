#!/bin/bash
echo "🔨 Building Virtual Office Platform..."

# Build client
echo "📦 Building client..."
npm run build:client

# Build server
echo "🖥️  Building server..."
npm run build:server

echo ""
echo "✅ Build complete! Files in dist/"
echo ""
echo "To start production server:"
echo "  npm start"
echo ""
