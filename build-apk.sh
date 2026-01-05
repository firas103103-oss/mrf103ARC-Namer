#!/bin/bash
# 🚀 Automated APK Build Script for ARC Operator
# Version: 2.0.0
# Author: GitHub Copilot

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Banner
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      ARC Operator APK Build Automation       ║${NC}"
echo -e "${BLUE}║              Version 2.0.0                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Environment Check
print_step "Step 1/7: Checking environment..."

if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the project root?"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found! Using defaults."
    print_warning "Create .env.production for custom configuration."
fi

if [ ! -d "android" ]; then
    print_error "Android directory not found! Run 'npx cap add android' first."
    exit 1
fi

print_success "Environment check passed"

# Step 2: Clean previous builds
print_step "Step 2/7: Cleaning previous builds..."

rm -rf dist/
rm -rf android/app/build/

print_success "Cleaned previous builds"

# Step 3: Install dependencies
print_step "Step 3/7: Installing/updating dependencies..."

npm ci || npm install

print_success "Dependencies installed"

# Step 4: Build web application
print_step "Step 4/7: Building web application..."

# Set NODE_ENV for production build
export NODE_ENV=production

npm run build

if [ ! -d "dist/public" ]; then
    print_error "Build failed! dist/public directory not found."
    exit 1
fi

print_success "Web application built successfully"

# Step 5: Sync with Capacitor
print_step "Step 5/7: Syncing with Capacitor..."

npx cap sync android

print_success "Capacitor sync completed"

# Step 6: Build APK
print_step "Step 6/7: Building Android APK..."

cd android

# Check for build type (default: release)
BUILD_TYPE="${1:-release}"

if [ "$BUILD_TYPE" = "debug" ]; then
    print_warning "Building DEBUG APK (not optimized)"
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
else
    print_step "Building RELEASE APK (optimized & minified)"
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
fi

cd ..

# Step 7: Verify APK
print_step "Step 7/7: Verifying APK..."

if [ -f "android/$APK_PATH" ]; then
    APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)
    print_success "APK built successfully!"
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            BUILD SUCCESSFUL! 🎉                ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "📦 APK Location: ${BLUE}android/$APK_PATH${NC}"
    echo -e "📊 APK Size: ${YELLOW}$APK_SIZE${NC}"
    echo -e "📱 Version: ${GREEN}2.0.0 (versionCode: 200)${NC}"
    echo ""
    
    # Show next steps
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Test APK: adb install android/$APK_PATH"
    echo "  2. Or copy APK to device and install manually"
    echo "  3. For signed APK, configure signing in android/app/build.gradle"
    echo ""
    
    # Show APK info
    if command -v aapt &> /dev/null; then
        print_step "APK Information:"
        aapt dump badging "android/$APK_PATH" | grep -E "package|application-label|sdkVersion|targetSdkVersion"
    fi
else
    print_error "APK build failed! Check logs above for errors."
    exit 1
fi

# Success exit
exit 0
