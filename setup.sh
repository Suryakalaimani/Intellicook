#!/bin/bash

echo ""
echo "===== Recipe Generator Setup ====="
echo ""
echo "This script will help you set up the Recipe Generator app."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed:"
node --version

echo ""
echo "Installing dependencies..."
cd backend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "node_modules already exists, skipping npm install"
else
    echo "Running npm install..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed"
        exit 1
    fi
fi

echo ""
echo "===== Setup Complete! ====="
echo ""
echo "Next steps:"
echo "1. Get Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Edit backend/.env and add your API key"
echo "3. Run: npm start"
echo "4. Open: http://localhost:3000"
echo ""
