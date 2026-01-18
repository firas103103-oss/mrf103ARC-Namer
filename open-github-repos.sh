#!/bin/bash
# فتح صفحات إنشاء المستودعات في المتصفح

REPOS=(
  "arc-namer-cli"
  "arc-namer-core"
  "arc-namer-vscode"
  "mrf103-arc-ecosystem"
  "mrf103-landing"
  "xbook-engine"
)

echo "🌐 فتح صفحات إنشاء المستودعات..."
echo ""

for repo in "${REPOS[@]}"; do
    url="https://github.com/new?name=$repo&owner=firas103103-oss&description=Part%20of%20MRF103%20Ecosystem&visibility=public"
    echo "📦 $repo"
    echo "   $url"
    
    # فتح في المتصفح
    if command -v xdg-open &> /dev/null; then
        xdg-open "$url" 2>/dev/null &
    elif [[ -n "$BROWSER" ]]; then
        "$BROWSER" "$url" 2>/dev/null &
    fi
    
    sleep 2
done

echo ""
echo "✅ تم فتح كل الروابط في المتصفح"
echo ""
echo "بعد إنشاء المستودعات على GitHub، نفذ:"
echo "   ./push-all-repos.sh"
