#!/bin/bash
echo "📁 Creating upload directories..."

mkdir -p uploads/cloning/voices
mkdir -p uploads/cloning/photos
mkdir -p uploads/cloning/documents

touch uploads/.gitkeep
touch uploads/cloning/.gitkeep

echo "✅ Upload directories created"
