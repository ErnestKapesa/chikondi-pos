#!/bin/bash

# Chikondi POS - Vercel Deployment Script

echo "🚀 Chikondi POS - Vercel Deployment"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
else
    echo "✅ Already logged into Vercel"
fi

echo ""

# Build the project first
echo "🔨 Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "When prompted, answer:"
echo "  - Set up and deploy? Y"
echo "  - Project name: chikondi-pos"
echo "  - Directory: ./"
echo "  - Modify settings? N"
echo ""

if vercel --prod; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Add environment variable in Vercel dashboard:"
    echo "   VITE_API_URL = https://chikondi-pos.onrender.com"
    echo ""
    echo "2. Redeploy to apply environment variables:"
    echo "   vercel --prod"
    echo ""
    echo "3. Test your live app!"
    echo ""
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi