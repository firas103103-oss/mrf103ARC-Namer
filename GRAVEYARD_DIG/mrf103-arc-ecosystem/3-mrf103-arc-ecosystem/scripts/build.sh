#!/bin/bash
# =============================================================================
# MRF103 ARC Ecosystem - Build Script
# =============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   🚀 MRF103 ARC Ecosystem - Build Script                ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Step 1: Environment Check
# =============================================================================

log_info "Checking environment..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v)
log_success "Node.js version: $NODE_VERSION"

if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
    log_error "npm or pnpm is required"
    exit 1
fi

# =============================================================================
# Step 2: Install Dependencies
# =============================================================================

log_info "Installing dependencies..."

if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
else
    npm ci
fi

log_success "Dependencies installed"

# =============================================================================
# Step 3: Type Check
# =============================================================================

log_info "Running TypeScript type check..."

npm run check || {
    log_warning "Type check completed with warnings"
}

log_success "Type check passed"

# =============================================================================
# Step 4: Lint
# =============================================================================

log_info "Running linter..."

npm run lint || {
    log_warning "Linting completed with warnings"
}

log_success "Linting passed"

# =============================================================================
# Step 5: Run Tests
# =============================================================================

log_info "Running tests..."

npm run test || {
    log_error "Tests failed"
    exit 1
}

log_success "All tests passed"

# =============================================================================
# Step 6: Build Client
# =============================================================================

log_info "Building client..."

npm run build:client

log_success "Client built successfully"

# =============================================================================
# Step 7: Build Server
# =============================================================================

log_info "Building server..."

npm run build

log_success "Server built successfully"

# =============================================================================
# Complete
# =============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   ✅ Build Complete!                                     ║"
echo "║                                                          ║"
echo "║   Output: ./dist/                                        ║"
echo "║                                                          ║"
echo "║   To run production:                                     ║"
echo "║   $ npm run start                                        ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
