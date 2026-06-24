#!/bin/bash
# Push Austin Sites to GitHub Pages
# Run this after authenticating with GitHub CLI

set -e

echo "=== Pushing to GitHub Pages ==="

# Check if gh is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ GitHub CLI not authenticated"
    echo "Run: gh auth login"
    echo "Or set GH_TOKEN environment variable"
    exit 1
fi

# Create repo if it doesn't exist
if ! gh repo view lemwebsites/austin-sites > /dev/null 2>&1; then
    echo "Creating repo..."
    gh repo create austin-sites --public --description "Austin business website mockups" --homepage "https://lemwebsites.github.io/austin-sites"
fi

# Add remote
if ! git remote | grep origin > /dev/null; then
    git remote add origin https://github.com/lemwebsites/austin-sites.git
fi

# Commit and push
git add .
git commit -m "Add Rapalo Handyman Services mockup site" || true
git push -u origin master

echo "✅ Pushed to GitHub!"
echo ""
echo "Enable GitHub Pages:"
echo "  1. Go to https://github.com/lemwebsites/austin-sites/settings/pages"
echo "  2. Source: Deploy from a branch"
echo "  3. Branch: master / (root)"
echo "  4. Save"
echo ""
echo "Your site will be live at:"
echo "  https://lemwebsites.github.io/austin-sites/rapalo-handyman-services/"
