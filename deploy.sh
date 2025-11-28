#!/bin/bash
echo "🚀 Starting Deployment Sequence..."

# Remove nested .git if it exists (fixes submodule issue)
rm -rf packages/web-ui/.git

# Add all changes
echo "📦 Staging files..."
git add .

# Commit changes
echo "💾 Committing..."
git commit -m "Upgrade: Deploying Quantum Command Center & Tesla Forge UI"

# Push to main
echo "📡 Pushing to Vercel..."
git push origin main

echo "✅ Deployment Triggered! Check Vercel dashboard."