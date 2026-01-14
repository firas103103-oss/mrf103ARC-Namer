#!/bin/bash

# ARC Namer v2.1.0 - Local APK Build Script
# Builds APK for Android without CI/CD Maven issues
# Usage: ./build-apk-local.sh [release|debug]

set -e

BUILD_TYPE="${1:-release}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "═══════════════════════════════════════════════════════════"
echo "   ARC Namer v2.1.0 - Local APK Builder"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Build Type: $BUILD_TYPE"
echo "Project Dir: $SCRIPT_DIR"
echo "Android Dir: $ANDROID_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js first."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm first."
  exit 1
fi

if ! command -v java &> /dev/null; then
  echo "❌ Java not found. Please install Java (JDK 11+) first."
  exit 1
fi

if [ ! -d "$ANDROID_DIR" ]; then
  echo "❌ Android directory not found at $ANDROID_DIR"
  exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Step 1: Build web assets
echo "Step 1/5: Building web assets..."
cd "$SCRIPT_DIR"
npm run build > /dev/null 2>&1
echo "✅ Web assets built successfully"
echo ""

# Step 2: Sync to Capacitor
echo "Step 2/5: Syncing to Capacitor..."
cd "$SCRIPT_DIR"
npx cap sync android > /dev/null 2>&1
echo "✅ Capacitor sync complete"
echo ""

# Step 3: Update gradle.properties for local builds
echo "Step 3/5: Configuring Gradle for local build..."
GRADLE_PROPS="$ANDROID_DIR/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
  # Use local repository as fallback
  if ! grep -q "maven.*mavenCentral" "$GRADLE_PROPS"; then
    cat >> "$GRADLE_PROPS" << 'EOF'

# Local build configuration
org.gradle.java.home=/usr/lib/jvm/java-11-openjdk-amd64
EOF
    echo "✅ Gradle properties updated"
  fi
else
  echo "⚠️  gradle.properties not found, continuing..."
fi
echo ""

# Step 4: Build APK
echo "Step 4/5: Building APK (this may take 2-5 minutes)..."
cd "$ANDROID_DIR"

if [ "$BUILD_TYPE" = "release" ]; then
  echo "Building RELEASE APK..."
  # For release builds, you would typically need a keystore
  # For now, building as debuggable release
  ./gradlew assembleRelease \
    -DskipTests \
    --no-daemon \
    --console=plain \
    2>&1 | grep -E "(BUILD|error|warning|task)" || true
  
  APK_OUTPUT="app/build/outputs/apk/release"
  APK_FILE=$(find "$APK_OUTPUT" -name "*.apk" -type f 2>/dev/null | head -1)
else
  echo "Building DEBUG APK..."
  ./gradlew assembleDebug \
    -DskipTests \
    --no-daemon \
    --console=plain \
    2>&1 | grep -E "(BUILD|error|warning|task)" || true
  
  APK_OUTPUT="app/build/outputs/apk/debug"
  APK_FILE=$(find "$APK_OUTPUT" -name "*.apk" -type f 2>/dev/null | head -1)
fi

if [ -z "$APK_FILE" ] || [ ! -f "$APK_FILE" ]; then
  echo "❌ APK build failed. Check the error messages above."
  exit 1
fi

echo "✅ APK built successfully"
echo ""

# Step 5: Copy to output directory
echo "Step 5/5: Packaging build artifacts..."
OUTPUT_DIR="$SCRIPT_DIR/builds/apk_$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"

# Copy APK
cp "$APK_FILE" "$OUTPUT_DIR/"
APK_BASENAME=$(basename "$APK_FILE")
echo "✅ APK saved: $OUTPUT_DIR/$APK_BASENAME"

# Create build info
cat > "$OUTPUT_DIR/BUILD_INFO.txt" << EOF
ARC Namer v2.1.0 - APK Build Report
Build Date: $(date)
Build Type: $BUILD_TYPE
APK File: $APK_BASENAME
APK Size: $(du -h "$OUTPUT_DIR/$APK_BASENAME" | cut -f1)

Build Environment:
- Node: $(node --version)
- npm: $(npm --version)
- Java: $(java -version 2>&1 | head -1)
- Gradle: $(cd "$ANDROID_DIR" && ./gradlew --version | head -1)

Signing Information:
$([ "$BUILD_TYPE" = "debug" ] && echo "- Debug key (auto-generated)" || echo "- Requires manual signing with production keystore")

Instructions:
1. For testing: adb install "$APK_BASENAME"
2. For distribution: Sign with production keystore before uploading to Play Store

Build Command:
./build-apk-local.sh $BUILD_TYPE

EOF

echo "✅ Build info created"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "   ✅ APK BUILD COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Output Directory: $OUTPUT_DIR"
echo "APK File: $APK_BASENAME"
echo "APK Size: $(du -h "$OUTPUT_DIR/$APK_BASENAME" | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Test on device: adb install $OUTPUT_DIR/$APK_BASENAME"
echo "2. Or upload to Play Store with proper signing"
echo ""
