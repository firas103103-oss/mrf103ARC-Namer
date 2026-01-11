#!/bin/bash
echo "🔨 Building XBio Platform..."

# Build client
echo "📦 Building client..."
npm run build:client

# Build server  
echo "🖥️  Building server..."
npm run build:server

echo ""
echo "✅ Build complete!"
echo "📦 Output in dist/ directory"
echo ""
