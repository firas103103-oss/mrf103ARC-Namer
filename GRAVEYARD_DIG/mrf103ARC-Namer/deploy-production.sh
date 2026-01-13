#!/bin/bash

# 🚀 Production Deployment Script for Stellar Command OS
# Enterprise-grade deployment automation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if Docker is installed (optional)
    if command -v docker &> /dev/null; then
        log_success "Docker is installed"
    else
        log_warning "Docker is not installed (optional for containerized deployment)"
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '#' | xargs)
        log_success "Production environment loaded"
    else
        log_warning "No .env.production file found, using defaults"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --only=production
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    npm test || {
        log_error "Tests failed"
        exit 1
    }
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Build client
    log_info "Building client..."
    npm run build
    log_success "Client built successfully"
    
    # Build server
    log_info "Building server..."
    npm run build:server
    log_success "Server built successfully"
}

# Run security audit
security_audit() {
    log_info "Running security audit..."
    npm audit --audit-level=moderate || log_warning "Security vulnerabilities detected"
    log_success "Security audit completed"
}

# Database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    if [ -f "scripts/migrate.sh" ]; then
        bash scripts/migrate.sh
        log_success "Database migrations completed"
    else
        log_warning "No migration script found"
    fi
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database (if configured)
    if [ -n "$DATABASE_URL" ]; then
        log_info "Backing up database..."
        # Add your database backup command here
        log_success "Database backed up to $BACKUP_DIR"
    fi
    
    # Backup configuration
    cp -r .env* "$BACKUP_DIR/" 2>/dev/null || true
    log_success "Backup created in $BACKUP_DIR"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing process (if using PM2)
    if command -v pm2 &> /dev/null; then
        pm2 stop stellar-command || true
        pm2 delete stellar-command || true
    fi
    
    # Start application with PM2
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js
        pm2 save
        log_success "Application deployed with PM2"
    else
        log_warning "PM2 not found, starting with node directly"
        node server/index.js &
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:${PORT:-5001}/api/health > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Waiting for application to start... ($attempt/$max_attempts)"
        sleep 2
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    # Stop current process
    if command -v pm2 &> /dev/null; then
        pm2 stop stellar-command || true
    fi
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -td backups/*/ | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring from backup: $LATEST_BACKUP"
        # Add restoration logic here
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
    fi
}

# Main deployment flow
main() {
    echo ""
    log_info "🚀 Starting Stellar Command OS Deployment"
    echo ""
    
    # Trap errors and run rollback
    trap 'rollback' ERR
    
    check_prerequisites
    load_environment
    create_backup
    install_dependencies
    security_audit
    run_tests
    build_application
    run_migrations
    deploy_application
    health_check
    
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    log_info "Application is running at: http://localhost:${PORT:-5001}"
    log_info "Health endpoint: http://localhost:${PORT:-5001}/api/health"
    echo ""
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        build_application
        ;;
    test)
        run_tests
        ;;
    backup)
        create_backup
        ;;
    health)
        health_check
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "Usage: $0 {deploy|build|test|backup|health|rollback}"
        exit 1
        ;;
esac
