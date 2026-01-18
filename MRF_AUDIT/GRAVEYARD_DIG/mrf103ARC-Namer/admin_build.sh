#!/bin/bash
# Administrator script to prepare and build the ARC system.
# This script should be executed from the project root directory.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Step 1: Installing project dependencies..."
# Install dependencies based on the package-lock.json file.
# This ensures a consistent and reproducible dependency tree.
npm install

echo "Step 2: Building project for production..."
# Execute the build script defined in package.json.
# This will compile TypeScript, bundle the client-side application,
# and place all necessary artifacts in the 'dist/' directory.
npm run build

echo "Build complete. The 'dist' directory is now populated with production artifacts."
