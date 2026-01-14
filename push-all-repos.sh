#!/bin/bash
# Push المستودعات الموجودة (بدون إنشاء repos جديدة)

OWNER="firas103103-oss"
BASE_DIR="EXTRACTED_REPOS"

REPOS=(
  "arc-namer-cli"
  "arc-namer-core"
  "arc-namer-vscode"
  "mrf103-arc-ecosystem"
  "mrf103-landing"
  "xbook-engine"
)

echo "🔗 إنشاء المستودعات يدوياً على GitHub أولاً:"
echo ""
for repo in "${REPOS[@]}"; do
    echo "https://github.com/new?name=$repo&owner=$OWNER"
done

echo ""
echo "بعد إنشاء المستودعات، اضغط Enter للمتابعة..."
read -r

echo ""
echo "🚀 بدء رفع المستودعات..."
echo ""

for repo in "${REPOS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$BASE_DIR/$repo"
    
    # إضافة remote
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$OWNER/$repo.git"
    
    # Push
    if git push -u origin main; then
        echo "✅ تم رفع $repo بنجاح"
    else
        echo "❌ فشل رفع $repo"
    fi
    
    echo ""
    cd - > /dev/null
done

echo "✨ اكتملت العملية!"
