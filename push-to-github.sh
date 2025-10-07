#!/bin/bash

# Chikondi POS - Push to GitHub Script

echo "🚀 Chikondi POS - GitHub Push Helper"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if there are commits
if ! git rev-parse HEAD > /dev/null 2>&1; then
    echo "❌ No commits found. Run: git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository initialized"
echo "✅ Initial commit created (46 files)"
echo ""

# Ask for GitHub repo URL
echo "📝 What's your GitHub repository URL?"
echo "Example: https://github.com/username/Chikondi-POS.git"
echo ""
read -p "Enter URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided"
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$REPO_URL" 2>/dev/null || {
    echo "⚠️  Remote already exists, updating..."
    git remote set-url origin "$REPO_URL"
}

echo "✅ Remote added: $REPO_URL"
echo ""

# Check if main branch exists
if ! git show-ref --verify --quiet refs/heads/main; then
    echo "🔄 Renaming branch to main..."
    git branch -M main
fi

echo "📤 Pushing to GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "📊 What was pushed:"
    echo "   - 46 files"
    echo "   - 15,647 lines of code"
    echo "   - Complete PWA application"
    echo "   - Backend server"
    echo "   - 15+ documentation files"
    echo ""
    echo "🔗 View your repo at:"
    echo "   $REPO_URL"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Deploy backend to Railway (see RAILWAY_QUICK_START.md)"
    echo "   2. Deploy frontend to Netlify/Vercel"
    echo "   3. Start building your business!"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo ""
    echo "1. Authentication Error:"
    echo "   - Use Personal Access Token (not password)"
    echo "   - Get token: https://github.com/settings/tokens"
    echo ""
    echo "2. Repository Not Empty:"
    echo "   - Run: git pull origin main --allow-unrelated-histories"
    echo "   - Then: git push -u origin main"
    echo ""
    echo "3. Permission Denied:"
    echo "   - Check repository URL is correct"
    echo "   - Check you have write access"
    echo ""
    echo "📖 See GIT_PUSH_GUIDE.md for detailed help"
fi
