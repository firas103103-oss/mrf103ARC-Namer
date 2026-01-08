#!/bin/bash

echo "🚀 Installing Super AI System dependencies..."

# Install required packages
npm install --save prom-client axios

# Install dev dependencies
npm install --save-dev @types/prom-client

echo "✅ Dependencies installed successfully!"
echo ""
echo "📦 Installed packages:"
echo "   - prom-client (Prometheus metrics)"
echo "   - axios (HTTP client for notifications)"
echo ""
echo "🎯 Next steps:"
echo "   1. Configure environment variables in .env"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:5001/api/metrics"
echo ""
