#!/bin/bash
echo "🧪 Running tests for all projects..."

cd 2-xbook-engine && npm test && cd ..
cd 4-arc-namer-core && npm test && cd ..
cd 5-arc-namer-cli && npm test && cd ..

echo "✅ All tests passed!"
