#!/bin/bash
export JAVA_HOME="$HOME/java/21.0.9-amzn"
export PATH="$JAVA_HOME/bin:$PATH"
cd /workspaces/mrf103ARC-Namer
npm run build
npx cap sync android
cd android
./gradlew assembleDebug --no-daemon
echo ""
echo "✅ APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
ls -lh app/build/outputs/apk/debug/app-debug.apk 2>/dev/null || echo "❌ APK not found"
