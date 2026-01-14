#!/bin/bash
echo "🔨 Building all projects..."

cd 2-xbook-engine && npm run build && cd ..
cd 4-arc-namer-core && npm run build && cd ..
cd 5-arc-namer-cli && npm run build && cd ..
cd 6-arc-namer-vscode && npm run build && cd ..

echo "✅ All projects built!"
