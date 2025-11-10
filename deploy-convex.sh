#!/bin/bash

# Convex Deployment Script
# This script will deploy your Convex backend functions to the cloud

set -e  # Exit on error

echo "================================================"
echo "  Convex Backend Deployment Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "convex.json" ]; then
    echo "❌ Error: convex.json not found!"
    echo "   Please run this script from the project root directory."
    exit 1
fi

# Check if convex directory exists
if [ ! -d "convex" ]; then
    echo "❌ Error: convex/ directory not found!"
    exit 1
fi

echo "✅ Project configuration found"
echo "   Project: zany-puffin-357"
echo "   URL: https://zany-puffin-357.convex.cloud"
echo ""

# Count the number of Convex functions
function_count=$(ls -1 convex/*.ts 2>/dev/null | wc -l)
echo "📦 Found $function_count Convex modules to deploy:"
ls -1 convex/*.ts | sed 's/convex\//   - /'
echo ""

# Check if already logged in
echo "🔐 Checking authentication..."
if npx convex deploy --dry-run &>/dev/null; then
    echo "✅ Already authenticated!"
else
    echo "⚠️  Not authenticated. Starting login process..."
    echo ""
    echo "   A browser window will open for authentication."
    echo "   Please log in with your Convex account."
    echo ""

    # Attempt login
    if ! npx convex login; then
        echo ""
        echo "❌ Login failed!"
        echo ""
        echo "Alternative: Use a Deploy Key"
        echo "1. Get a deploy key from: https://dashboard.convex.dev/"
        echo "2. Go to Settings → Deploy Keys in your project"
        echo "3. Create a new deploy key"
        echo "4. Run: export CONVEX_DEPLOY_KEY='your-key-here'"
        echo "5. Run this script again"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to Convex
if npx convex deploy --yes; then
    echo ""
    echo "================================================"
    echo "  ✅ Deployment Successful!"
    echo "================================================"
    echo ""
    echo "Your Convex backend is now live! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Start your Next.js dev server: npm run dev"
    echo "2. Test manager registration: http://localhost:3000/manager/register"
    echo "3. Check Convex dashboard: https://dashboard.convex.dev/"
    echo ""
    echo "New functions deployed:"
    echo "  - managers:registerManager"
    echo "  - managers:loginManager"
    echo "  - organizations:createOrganization"
    echo "  - employees:addEmployee"
    echo "  - groups:createGroup"
    echo "  - responses:submitResponse"
    echo "  - analytics:getOrganizationAnalytics"
    echo "  - emailTokens:generateEmailToken"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Please check the error messages above."
    echo "Common issues:"
    echo "  - Network connectivity problems"
    echo "  - Syntax errors in Convex functions"
    echo "  - Schema validation errors"
    echo ""
    echo "For help, see: CONVEX_DEPLOYMENT_GUIDE.md"
    exit 1
fi
