#!/bin/bash
# MISSION-CRITICAL: Add Sidebar to ALL remaining pages
# This script systematically wraps each page with SidebarProvider

cd /workspaces/mrf103ARC-Namer

echo "🚀 PHASE 1 SIDEBAR MANDATE - Batch Implementation"
echo "=================================================="
echo ""

# Define pages that still need sidebar (excluding already done: Home, AnalyticsHub, virtual-office)
PAGES=(
  "BioSentinel"
  "AdminControlPanel" 
  "dashboard"
  "TeamCommandCenter"
  "MasterAgentCommand"
  "GrowthRoadmap"
  "QuantumWarRoom"
  "InvestigationLounge"
  "OperationsSimulator"
  "TemporalAnomalyLab"
  "SystemArchitecture"
  "SelfCheck"
  "Cloning"
)

for page in "${PAGES[@]}"; do
  FILE="client/src/pages/${page}.tsx"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  Skipping $page - file not found"
    continue
  fi
  
  # Check if already has sidebar
  if grep -q "SidebarProvider" "$FILE"; then
    echo "✅ $page - Already implemented"
    continue
  fi
  
  echo "🔧 Processing $page..."
  
  # Create backup
  cp "$FILE" "${FILE}.backup"
  
  # Add imports if not present
  if ! grep -q "import.*SidebarProvider" "$FILE"; then
    # Find the last import line
    last_import_line=$(grep -n "^import " "$FILE" | tail -1 | cut -d: -f1)
    
    # Insert sidebar imports after last import
    sed -i "${last_import_line}a\\
import { SidebarProvider, SidebarInset, SidebarTrigger } from \"@/components/ui/sidebar\";\\
import { AppSidebar } from \"@/components/app-sidebar\";" "$FILE"
  fi
  
  echo "   ✓ Imports added"
  echo "   ⚠️  Manual wrapping required for $page - see template below"
  
done

echo ""
echo "==============================================="
echo "📝 TEMPLATE for manual wrapping:"
echo "==============================================="
cat <<'EOF'

// Wrap the main return statement like this:

return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">PAGE_TITLE</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
        {/* YOUR EXISTING CONTENT HERE */}
      </main>
    </SidebarInset>
  </SidebarProvider>
);

EOF

echo ""
echo "✅ Import phase complete. Review changes and apply manual wrappers."
echo "To restore backups: find client/src/pages -name '*.backup' -exec bash -c 'mv \"\$1\" \"\${1%.backup}\"' _ {} \\;"
