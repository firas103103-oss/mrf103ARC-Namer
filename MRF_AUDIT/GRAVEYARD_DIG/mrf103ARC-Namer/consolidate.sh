#!/bin/bash

echo "🔄 Starting consolidation..."

# Create unified structure
mkdir -p _FINAL_REPOS_UNIFIED

# Move existing repos
echo "📦 Moving existing products..."
cp -r _FINAL_REPOS/1-mrf103-landing _FINAL_REPOS_UNIFIED/
cp -r _FINAL_REPOS/2-xbook-engine _FINAL_REPOS_UNIFIED/
cp -r _FINAL_REPOS/3-mrf103-arc-ecosystem _FINAL_REPOS_UNIFIED/

# Move arc-namer repos
echo "📦 Moving arc-namer products..."
cp -r _FINAL_REPOS-1/arc-namer-core _FINAL_REPOS_UNIFIED/4-arc-namer-core
cp -r _FINAL_REPOS-1/arc-namer-cli _FINAL_REPOS_UNIFIED/5-arc-namer-cli
cp -r _FINAL_REPOS-1/arc-namer-vscode _FINAL_REPOS_UNIFIED/6-arc-namer-vscode

# Copy documentation
echo "📚 Copying documentation..."
cp _FINAL_REPOS/OPERATION_TRINITY_CHECKLIST.md _FINAL_REPOS_UNIFIED/

# Create new master README
cat > _FINAL_REPOS_UNIFIED/README.md << 'EOFREADME'
# 🚀 MRF103 ECOSYSTEM - Unified Repository

## 📦 Products Structure

```
_FINAL_REPOS_UNIFIED/
├── 1-mrf103-landing/          🌐 NEXUS Portal
├── 2-xbook-engine/            🔥 FORGE Content Engine
├── 3-mrf103-arc-ecosystem/    🎯 COMMAND + 💓 PULSE Platform
├── 4-arc-namer-core/          📚 Core Naming Library
├── 5-arc-namer-cli/           ⚡ CLI Tool
├── 6-arc-namer-vscode/        🎨 VS Code Extension
├── FULL_PROJECT_REPORT.md     📊 Complete Report
├── PRODUCTS_MANIFEST.json     📋 Products Manifest
├── README_COMPLETE.md         📖 Full Documentation
└── QUICK_SUMMARY.md           📄 Quick Summary
```

## 🎯 6 Repositories Ready

| # | Product | Type | Status |
|---|---------|------|--------|
| 1 | NEXUS Portal | Landing Page | ✅ Ready |
| 2 | FORGE Engine | NPM Package | ✅ Ready |
| 3 | COMMAND Platform | Full Stack | ✅ Ready |
| 4 | Arc Namer Core | NPM Package | ✅ Ready |
| 5 | Arc Namer CLI | CLI Tool | ✅ Ready |
| 6 | Arc Namer VSCode | Extension | ✅ Ready |

## 🚀 Quick Start

```bash
# Install all dependencies
./install-all.sh

# Build all projects
./build-all.sh

# Run tests
./test-all.sh
```

## 📚 Documentation

- [Full Project Report](../FULL_PROJECT_REPORT.md)
- [Products Manifest](../PRODUCTS_MANIFEST.json)
- [Complete Guide](../README_COMPLETE.md)
- [Quick Summary](../QUICK_SUMMARY.md)

---

**MRF103 Holdings** © 2026
EOFREADME

# Create install script
cat > _FINAL_REPOS_UNIFIED/install-all.sh << 'EOFINSTALL'
#!/bin/bash
echo "📦 Installing dependencies for all projects..."

cd 2-xbook-engine && npm install && cd ..
cd 3-mrf103-arc-ecosystem && npm install && cd ..
cd 4-arc-namer-core && npm install && cd ..
cd 5-arc-namer-cli && npm install && cd ..
cd 6-arc-namer-vscode && npm install && cd ..

echo "✅ All dependencies installed!"
EOFINSTALL

# Create build script
cat > _FINAL_REPOS_UNIFIED/build-all.sh << 'EOFBUILD'
#!/bin/bash
echo "🔨 Building all projects..."

cd 2-xbook-engine && npm run build && cd ..
cd 4-arc-namer-core && npm run build && cd ..
cd 5-arc-namer-cli && npm run build && cd ..
cd 6-arc-namer-vscode && npm run build && cd ..

echo "✅ All projects built!"
EOFBUILD

# Create test script
cat > _FINAL_REPOS_UNIFIED/test-all.sh << 'EOFTEST'
#!/bin/bash
echo "🧪 Running tests for all projects..."

cd 2-xbook-engine && npm test && cd ..
cd 4-arc-namer-core && npm test && cd ..
cd 5-arc-namer-cli && npm test && cd ..

echo "✅ All tests passed!"
EOFTEST

# Make scripts executable
chmod +x _FINAL_REPOS_UNIFIED/*.sh

echo ""
echo "✅ Consolidation complete!"
echo "📁 New unified directory: _FINAL_REPOS_UNIFIED/"
echo ""
echo "📊 Summary:"
find _FINAL_REPOS_UNIFIED -type f | wc -l | xargs echo "   Total files:"
du -sh _FINAL_REPOS_UNIFIED | awk '{print "   Total size: " $1}'
echo ""
echo "🗑️  Old directories can be removed with:"
echo "   rm -rf _FINAL_REPOS _FINAL_REPOS-1"
