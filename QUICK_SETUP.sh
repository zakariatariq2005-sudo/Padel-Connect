#!/bin/bash
# Quick Setup Script for Padel Connect

echo "🔧 Padel Connect - Quick Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ .env.local file exists"
else
  echo "⚠️  .env.local file not found"
  echo ""
  echo "Creating .env.local from template..."
  cat > .env.local << ENVFILE
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xgsncypsczrqgcecmpok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
ENVFILE
  echo "✅ Created .env.local file"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env.local and add your anon key!"
  echo "   Get it from: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/settings/api"
  echo ""
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ node_modules directory exists"
else
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your Supabase anon key"
echo "2. Set up database tables (see SETUP_CHECKLIST.md)"
echo "3. Run: npm run dev"
echo ""
