#!/bin/bash
# استخراج المستودعات الـ 6 وإنشاء Git repos منفصلة

# المستودعات الـ 6
declare -A REPOS=(
  ["1-mrf103-landing"]="mrf103-landing"
  ["2-xbook-engine"]="xbook-engine"
  ["3-mrf103-arc-ecosystem"]="mrf103-arc-ecosystem"
  ["4-arc-namer-core"]="arc-namer-core"
  ["5-arc-namer-cli"]="arc-namer-cli"
  ["6-arc-namer-vscode"]="arc-namer-vscode"
)

SOURCE_DIR="_FINAL_REPOS_UNIFIED"
TARGET_DIR="EXTRACTED_REPOS"

echo "🚀 بدء استخراج المستودعات..."

# إنشاء مجلد الاستخراج
mkdir -p "$TARGET_DIR"

for dir in "${!REPOS[@]}"; do
  repo_name="${REPOS[$dir]}"
  source_path="$SOURCE_DIR/$dir"
  target_path="$TARGET_DIR/$repo_name"
  
  echo ""
  echo "📦 معالجة: $repo_name"
  
  # نسخ المحتوى
  cp -r "$source_path" "$target_path"
  
  # إنشاء Git repo
  cd "$target_path"
  git init
  git add .
  git commit -m "Initial commit: Extract from mrf103ARC-Namer"
  
  echo "✅ تم: $repo_name"
  
  cd - > /dev/null
done

echo ""
echo "✨ تم استخراج كل المستودعات إلى: $TARGET_DIR"
echo ""
echo "📋 قائمة المستودعات المستخرجة:"
ls -1 "$TARGET_DIR"
