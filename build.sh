#!/usr/bin/env bash
set -o errexit

echo "========================================="
echo "🔨 Building React Frontend..."
echo "========================================="

cd front-end/homefront

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Build React app
echo "⚛️  Building React app..."
npm run build

echo "========================================="
echo "📋 Copying files to Django..."
echo "========================================="

cd ../..

# Create directories if they don't exist
mkdir -p back-end/static
mkdir -p back-end/static/images        # <-- ensure images folder exists
mkdir -p back-end/templates
mkdir -p back-end/media

# Backup images before cleaning
echo "📦 Backing up existing images..."
if [ -d "back-end/static/images" ]; then
    cp -r back-end/static/images back-end/images_backup
fi

# Remove old static files
echo "🧹 Cleaning old static files..."
rm -rf back-end/static/*

# Restore images after cleaning
echo "📦 Restoring custom images..."
if [ -d "back-end/images_backup" ]; then
    mkdir -p back-end/static/images
    cp -r back-end/images_backup/* back-end/static/images/
    rm -rf back-end/images_backup
    echo "✅ Custom images restored"
else
    echo "⚠️ No custom images to restore"
fi

# Copy React static files
echo "📂 Copying static files..."
if [ -d "front-end/homefront/build/static" ]; then
    cp -r front-end/homefront/build/static/* back-end/static/
    echo "✅ React static files copied"
else
    echo "❌ ERROR: build/static not found!"
    exit 1
fi

# Copy index.html
echo "📄 Copying index.html..."
if [ -f "front-end/homefront/build/index.html" ]; then
    cp front-end/homefront/build/index.html back-end/templates/
    echo "✅ index.html copied"
else
    echo "❌ ERROR: build/index.html not found!"
    exit 1
fi

echo "========================================="
echo "🐍 Setting up Python environment..."
echo "========================================="

cd back-end

# Install Python dependencies
echo "📦 Installing Python packages..."
pip install -r requirements.txt

# Collect static files
echo "📦 Collecting static files (Django)..."
python manage.py collectstatic --no-input

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate

echo "========================================="
echo "✅ Build Complete!"
echo "========================================="
echo ""
echo "To run locally:"
echo "  cd back-end"
echo "  python manage.py runserver"
echo ""
echo "Visit: http://localhost:8000"
echo "========================================="
