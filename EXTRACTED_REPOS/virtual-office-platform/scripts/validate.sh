#!/bin/bash

echo "🔍 Validating Virtual Office Platform Extraction..."
echo ""

ERRORS=0

# Check required files
echo "📂 Checking required files..."
FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  ".env.example"
  ".gitignore"
  "README.md"
  "client/index.html"
  "client/src/main.tsx"
  "client/src/App.tsx"
  "client/src/pages/Cloning.tsx"
  "server/index.ts"
  "server/routes/cloning.ts"
  "server/db/schema.ts"
  "server/db/connection.ts"
  "server/middleware/error-handler.ts"
  "server/middleware/multer-config.ts"
  "database/schema.sql"
  "docs/START_HERE.md"
  "docs/QUICK_START.md"
  "docs/API_REFERENCE.md"
  "docs/DEPLOYMENT.md"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Found: $file"
  fi
done

echo ""
echo "📁 Checking directories..."
DIRS=(
  "client/src/components/ui"
  "client/src/hooks"
  "client/src/lib"
  "client/src/styles"
  "server/routes"
  "server/db"
  "server/middleware"
  "uploads/cloning/voices"
  "uploads/cloning/photos"
  "uploads/cloning/documents"
  "scripts"
  "docs"
)

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ Missing directory: $dir"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Found: $dir"
  fi
done

echo ""
echo "📦 Checking node_modules..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Run 'npm install' first."
else
  echo "✅ node_modules exists"
fi

echo ""
echo "🔧 Checking package.json dependencies..."
REQUIRED_DEPS=(
  "express"
  "react"
  "drizzle-orm"
  "multer"
  "bcrypt"
  "pg"
)

for dep in "${REQUIRED_DEPS[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    echo "✅ Dependency: $dep"
  else
    echo "❌ Missing dependency: $dep"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "📊 Validation Summary"
echo "===================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ All checks passed! The extraction is complete."
  echo ""
  echo "Next steps:"
  echo "1. Run 'npm install' if you haven't already"
  echo "2. Copy .env.example to .env and configure"
  echo "3. Run 'npm run dev' to start development"
  exit 0
else
  echo "❌ Found $ERRORS issue(s). Please fix before proceeding."
  exit 1
fi
