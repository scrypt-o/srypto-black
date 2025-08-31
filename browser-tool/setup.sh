#!/bin/bash

# Browser Tool Setup Script
# Run this in any new project to set up fast browser testing

echo "🚀 Setting up Browser Tool..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x screen-grab

# Create screenshot directory
echo "📁 Creating screenshot directory..."
mkdir -p ../docs/testing/screen-grabs

# Test installation
echo "🧪 Testing installation..."
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null; then
    echo "✅ Chrome/Chromium found"
else
    echo "⚠️  Chrome/Chromium not found - installing..."
    # Add Chrome installation for different systems
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y chromium-browser
    elif command -v yum &> /dev/null; then
        sudo yum install -y chromium
    else
        echo "❌ Please install Chrome/Chromium manually"
    fi
fi

# Test basic functionality
echo "🎯 Testing basic functionality..."
node quick-test.js http://example.com

echo ""
echo "✅ Browser Tool setup complete!"
echo ""
echo "📋 Usage:"
echo "  ./screen-grab http://localhost:3000/page"
echo "  ./screen-grab http://localhost:3000/page --mobile"
echo "  node quick-test.js http://localhost:3000/page"
echo ""
echo "📸 Screenshots saved to: docs/testing/screen-grabs/"
echo ""