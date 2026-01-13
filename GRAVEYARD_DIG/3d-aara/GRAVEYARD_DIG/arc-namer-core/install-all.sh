#!/bin/bash
echo "📦 Installing dependencies for all projects..."

cd 2-xbook-engine && npm install && cd ..
cd 3-mrf103-arc-ecosystem && npm install && cd ..
cd 4-arc-namer-core && npm install && cd ..
cd 5-arc-namer-cli && npm install && cd ..
cd 6-arc-namer-vscode && npm install && cd ..

echo "✅ All dependencies installed!"
