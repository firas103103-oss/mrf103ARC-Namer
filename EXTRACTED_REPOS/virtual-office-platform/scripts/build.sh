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

echo "🔨 Building Virtual Office Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Clean previous build
if [ -d "dist" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf dist
    echo "✅ Previous build cleaned"
    echo ""
fi

# Build client
echo "🎨 Building client..."
npm run build:client

if [ $? -ne 0 ]; then
    echo "❌ Client build failed"
    exit 1
fi

echo "✅ Client built successfully"
echo ""

# Check if server build script exists
if grep -q "build:server" package.json; then
    echo "⚙️  Building server..."
    npm run build:server
    
    if [ $? -ne 0 ]; then
        echo "❌ Server build failed"
        exit 1
    fi
    
    echo "✅ Server built successfully"
    echo ""
fi

# Display build info
echo "✅ Build complete!"
echo ""
echo "📊 Build Output:"
if [ -d "dist/public" ]; then
    echo "   Client: dist/public/"
    du -sh dist/public/
fi
if [ -d "dist/server" ]; then
    echo "   Server: dist/server/"
    du -sh dist/server/
fi
echo ""

echo "🚀 To start the production server:"
echo "   npm start"
echo ""
