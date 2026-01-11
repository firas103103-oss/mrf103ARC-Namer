#!/bin/bash
echo "🏗️  Building Virtual Office Platform..."

# Build client
echo "📦 Building client..."
npm run build:client

# Build server
echo "📦 Building server..."
npm run build:server

echo "✅ Build complete!"
echo "Run 'npm start' to start the production server"
