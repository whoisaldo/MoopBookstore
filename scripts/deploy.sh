#!/bin/bash

# 🚀 Moops Bookstore Deployment Script
# This script helps deploy your app to both GitHub Pages and Heroku

echo "🌟 Deploying Moops Bookstore..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes. Commit them first!"
    git status -s
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Build the frontend
print_status "Building frontend..."
cd client || exit 1

if [ ! -f ".env.production" ]; then
    print_warning "No .env.production found. Creating from template..."
    cp env.production .env.production
    print_warning "Please update .env.production with your Heroku app URL!"
fi

npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend build completed!"
else
    print_error "Frontend build failed!"
    exit 1
fi

cd ..

# Step 2: Commit and push to GitHub
print_status "Committing changes..."
git add .
git commit -m "🚀 Deploy: $(date)"

print_status "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Pushed to GitHub successfully!"
    print_status "GitHub Actions will deploy your frontend automatically."
else
    print_error "Failed to push to GitHub!"
    exit 1
fi

# Step 3: Deploy to Heroku (if Heroku remote exists)
if git remote | grep -q heroku; then
    print_status "Deploying to Heroku..."
    git push heroku main
    
    if [ $? -eq 0 ]; then
        print_success "Deployed to Heroku successfully!"
    else
        print_error "Heroku deployment failed!"
        print_status "Check your Heroku logs: heroku logs --tail"
    fi
else
    print_warning "No Heroku remote found. Skipping Heroku deployment."
    print_status "To set up Heroku:"
    print_status "  1. heroku create your-app-name"
    print_status "  2. heroku config:set MONGODB_URI='your-connection-string'"
    print_status "  3. heroku config:set JWT_SECRET='your-secret'"
fi

# Step 4: Show deployment URLs
echo
print_success "🎉 Deployment Complete!"
echo
print_status "Your app should be available at:"
echo "  Frontend: https://$(git config user.name).github.io/MoopsBookstore"
if git remote | grep -q heroku; then
    HEROKU_APP=$(heroku apps:info --json | jq -r '.app.name' 2>/dev/null || echo "your-heroku-app")
    echo "  Backend:  https://$HEROKU_APP.herokuapp.com"
fi
echo

print_status "Next steps:"
echo "  1. Wait 2-3 minutes for GitHub Pages to build"
echo "  2. Check your MongoDB Atlas dashboard"
echo "  3. Test your app functionality"
echo "  4. Monitor logs: heroku logs --tail"
echo
print_success "Happy reading! 📚✨"
