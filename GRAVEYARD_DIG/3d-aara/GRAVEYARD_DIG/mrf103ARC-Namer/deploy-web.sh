#!/bin/bash
echo "🚀 Starting ARC WebApp Deployment..."

# 1️⃣ Build frontend
echo "📦 Building frontend..."
npm install
npm run build || { echo "❌ Build failed"; exit 1; }

# 2️⃣ Check Firebase CLI
if ! command -v firebase &> /dev/null
then
    echo "⚙️ Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# 3️⃣ Login to Firebase (if needed)
firebase login || { echo "❌ Firebase login failed"; exit 1; }

# 4️⃣ Initialize hosting if missing
if [ ! -d "firebase.json" ]; then
  echo "⚙️ Initializing Firebase Hosting..."
  firebase init hosting
fi

# 5️⃣ Deploy to Firebase
echo "🌍 Deploying to Firebase Hosting..."
firebase deploy || { echo "❌ Deployment failed"; exit 1; }

echo "✅ Deployment complete!"
echo "🌐 Your app is live on:"
firebase hosting:sites:list

echo "-----------------------------------------"
echo "💡 Tip: Add your custom domain from Firebase Console → Hosting → Add Custom Domain"
echo "-----------------------------------------"