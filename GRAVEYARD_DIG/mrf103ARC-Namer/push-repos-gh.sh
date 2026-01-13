#!/bin/bash
# Push المستودعات باستخدام gh CLI

BASE_DIR="EXTRACTED_REPOS"

REPOS=(
  "arc-namer-cli"
  "arc-namer-core"
  "arc-namer-vscode"
  "mrf103-arc-ecosystem"
  "mrf103-landing"
  "xbook-engine"
)

echo "🚀 بدء رفع المستودعات باستخدام gh CLI..."
echo ""

for repo in "${REPOS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$BASE_DIR/$repo"
    
    # استخدام gh لإنشاء repo و push مباشرة
    if gh repo create "firas103103-oss/$repo" --public --source=. --remote=origin --push 2>&1; then
        echo "✅ تم رفع $repo بنجاح"
    else
        echo "⚠️  محاولة push للمستودع الموجود..."
        
        # إذا المستودع موجود، جرب push عادي
        git remote set-url origin "https://github.com/firas103103-oss/$repo.git" 2>/dev/null || \
        git remote add origin "https://github.com/firas103103-oss/$repo.git"
        
        # استخدام gh api للـ push
        if git push -u origin main 2>&1; then
            echo "✅ تم تحديث $repo بنجاح"
        else
            echo "❌ فشل رفع $repo"
        fi
    fi
    
    echo ""
    cd - > /dev/null
done

echo "✨ اكتملت العملية!"
echo ""
echo "🔗 تحقق من المستودعات:"
for repo in "${REPOS[@]}"; do
    echo "   https://github.com/firas103103-oss/$repo"
done
