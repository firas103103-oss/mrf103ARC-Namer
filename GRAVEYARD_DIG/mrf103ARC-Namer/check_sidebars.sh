#!/bin/bash
# Script to add sidebar to all remaining pages

# List of pages that need sidebar implementation
PAGES=(
  "virtual-office"
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

echo "Checking which pages still need Sidebar implementation..."

for page in "${PAGES[@]}"; do
  file="/workspaces/mrf103ARC-Namer/client/src/pages/${page}.tsx"
  if [ -f "$file" ]; then
    if grep -q "SidebarProvider" "$file"; then
      echo "✅ $page - Already has Sidebar"
    else
      echo "❌ $page - NEEDS Sidebar implementation"
    fi
  else
    echo "⚠️  $page - File not found"
  fi
done
