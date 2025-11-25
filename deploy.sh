#!/bin/bash

# Axiom Quantum Command Center - Deployment Script
# This script deploys the application to the main domain

echo "🚀 Initiating Quantum Deployment Sequence..."

# 1. Install dependencies
echo "🔧 Installing dependencies..."
npm install --legacy-peer-deps

# 2. Build the application
echo "🏗️ Building the Quantum Command Center..."
npm run build

# 3. Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# 4. Start the application
echo "🟢 Starting the Quantum Command Center..."
npm run start

echo "🎉 Deployment complete! The Quantum Command Center is now live."