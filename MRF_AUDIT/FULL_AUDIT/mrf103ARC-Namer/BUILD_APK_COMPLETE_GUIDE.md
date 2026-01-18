# 📱 دليل بناء APK الكامل - محدث 2.0.0

## 🎯 Overview

هذا الدليل الشامل لبناء ARC Operator Android APK بعد التحديثات والإصلاحات الأخيرة.

---

## ✅ التحسينات الجديدة (v2.0.0)

### 1. **Environment Management**
- ✅ `.env.production` - متغيرات Production
- ✅ `.env.development` - متغيرات Development
- ✅ `api-config.ts` - إدارة ذكية للـ API URLs

### 2. **Capacitor Configuration**
- ✅ Environment-aware config
- ✅ No hard-coded URLs
- ✅ Development/Production switching

### 3. **Android Build**
- ✅ minSdkVersion: 26 (Android 8.0+)
- ✅ versionCode: 200 (matches package.json)
- ✅ R8 optimization enabled
- ✅ Code shrinking in release builds

### 4. **Professional Branding**
- ✅ Custom logo design (arc-logo.svg)
- ✅ Neural network theme
- ✅ Neon Cyan/Purple color scheme

---

## 📋 المتطلبات

### Required:
- ✅ **Node.js** 20+ (يفضل LTS)
- ✅ **npm** 9+
- ✅ **Java JDK** 17+ (لـ Gradle)
- ✅ **Android SDK** Platform 35
- ✅ **Android Studio** (مستحسن للـ debugging)

### التحقق من التثبيت:
```bash
node --version    # v20.x.x
npm --version     # 9.x.x
java --version    # 17.x.x

# Android SDK
echo $ANDROID_HOME  # يجب أن يكون مسار SDK
```

---

## 🚀 طريقة البناء الآلية (موصى بها)

### الطريقة 1: Using Automated Script

```bash
# بناء Release APK (مُحسَّن)
./build-apk.sh

# أو بناء Debug APK (للتطوير)
./build-apk.sh debug
```

**الفوائد**:
- ✅ Automated validation
- ✅ Progress tracking
- ✅ Error handling
- ✅ APK information display

**الناتج**:
```
📦 APK Location: android/app/build/outputs/apk/release/app-release.apk
📊 APK Size: ~12-14 MB
📱 Version: 2.0.0 (versionCode: 200)
```

---

## 🛠️ الطريقة اليدوية (للتحكم الكامل)

### Step 1: إعداد Environment

```bash
# نسخ env template
cp .env.production .env

# تحرير المتغيرات إذا لزم الأمر
nano .env.production
```

**محتويات `.env.production`**:
```bash
VITE_API_URL=https://mrf103arc-namer-production-236c.up.railway.app
VITE_APP_NAME=ARC Operator
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
NODE_ENV=production
PORT=9002
```

### Step 2: تثبيت Dependencies

```bash
# Clean install (موصى به)
npm ci

# أو install عادي
npm install
```

### Step 3: بناء Web Application

```bash
# Production build
npm run build

# التحقق من الناتج
ls -lh dist/public/
# يجب أن ترى: index.html, assets/, favicon.png
```

### Step 4: Sync مع Capacitor

```bash
# Sync web build إلى Android
npx cap sync android

# أو update فقط
npx cap update android
```

### Step 5: Build APK

#### Release APK (للنشر):
```bash
cd android
./gradlew assembleRelease

# الناتج:
# android/app/build/outputs/apk/release/app-release.apk
```

#### Debug APK (للتطوير):
```bash
cd android
./gradlew assembleDebug

# الناتج:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📊 مقارنة Build Types

| Feature | Debug | Release |
|---------|-------|---------|
| **Optimization** | ❌ No | ✅ Yes (R8) |
| **Minification** | ❌ No | ✅ Yes |
| **Size** | ~18 MB | ~12 MB |
| **Debuggable** | ✅ Yes | ❌ No |
| **ProGuard** | ❌ No | ✅ Yes |
| **Performance** | Slow | Fast |
| **Use Case** | Development | Production |

---

## 🔐 Signing APK (للنشر على Google Play)

### Step 1: إنشاء Keystore

```bash
keytool -genkey -v -keystore arc-operator.keystore \
  -alias arc-operator-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# احفظ المعلومات في مكان آمن!
```

### Step 2: تكوين Signing في Gradle

**ملف**: `android/app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../arc-operator.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "arc-operator-key"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build مع Signing

```bash
# تعيين المتغيرات
export KEYSTORE_PASSWORD="your-password"
export KEY_PASSWORD="your-key-password"

# Build
cd android
./gradlew assembleRelease

# النتيجة: APK موقع جاهز للنشر
```

---

## 🧪 اختبار APK

### الطريقة 1: عبر USB Debugging

```bash
# تثبيت APK على جهاز متصل
adb install android/app/build/outputs/apk/release/app-release.apk

# أو استبدال APK موجود
adb install -r android/app/build/outputs/apk/release/app-release.apk

# فتح logcat للتطبيق
adb logcat | grep "ARC Operator"
```

### الطريقة 2: نقل ملف APK

```bash
# نسخ APK إلى الجهاز
adb push android/app/build/outputs/apk/release/app-release.apk /sdcard/

# تثبيت من مدير الملفات على الجهاز
```

### الطريقة 3: Email/Cloud

```bash
# إرسال APK عبر البريد أو رفعه على Google Drive
# تحميله على الجهاز وتثبيته مباشرة
```

---

## 🐛 استكشاف الأخطاء

### Problem 1: "ANDROID_HOME not set"

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# أضف إلى ~/.bashrc أو ~/.zshrc لجعلها دائمة
```

### Problem 2: "Gradle build failed"

```bash
# تنظيف Gradle cache
cd android
./gradlew clean

# إعادة Build
./gradlew assembleRelease --stacktrace
```

### Problem 3: "Out of memory"

```bash
# زيادة Gradle memory
# android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Problem 4: "APK not installing"

```bash
# إلغاء تثبيت النسخة القديمة
adb uninstall app.arc.operator

# ثم تثبيت النسخة الجديدة
adb install app-release.apk
```

### Problem 5: "App crashes on startup"

```bash
# فحص logcat
adb logcat | grep -E "AndroidRuntime|ARC"

# الأسباب المحتملة:
# - VITE_API_URL غير صحيح في .env.production
# - Server غير متاح
# - Permissions مفقودة في AndroidManifest.xml
```

---

## 📱 متطلبات الجهاز

### Minimum Requirements:
- ✅ Android 8.0 (API 26) أو أحدث
- ✅ 2 GB RAM
- ✅ 50 MB storage
- ✅ اتصال إنترنت

### Recommended:
- ✅ Android 11+ (API 30+)
- ✅ 4 GB RAM
- ✅ WiFi أو 4G/5G
- ✅ شاشة 5" أو أكبر

---

## 🎨 تخصيص Logo/Branding

### Logo Files:
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png        (48x48)
├── mipmap-hdpi/ic_launcher.png        (72x72)
├── mipmap-xhdpi/ic_launcher.png       (96x96)
├── mipmap-xxhdpi/ic_launcher.png      (144x144)
└── mipmap-xxxhdpi/ic_launcher.png     (192x192)
```

### إنشاء Icons من SVG:

```bash
# استخدام ImageMagick
convert -density 300 -background none \
  client/public/arc-logo.svg \
  -resize 192x192 \
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# كرر للأحجام الأخرى
```

### Online Tools:
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://appicon.co/)

---

## 📦 تحسين حجم APK

### Current Size: ~12-14 MB
### Target: <10 MB

**التحسينات الممكنة**:

1. **Enable App Bundle** (بدلاً من APK)
```bash
./gradlew bundleRelease
# ناتج: app-release.aab (~8 MB)
```

2. **Remove unused resources**
```gradle
android {
    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
        }
    }
}
```

3. **Use WebP images** بدلاً من PNG
4. **Split APKs by ABI**
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a'
        }
    }
}
```

---

## 🚀 نشر على Google Play Store

### Checklist:

- [ ] APK موقع بـ Release keystore
- [ ] versionCode مُحدَّث (200+)
- [ ] Screenshots (Phone, 7-inch, 10-inch)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Privacy policy URL
- [ ] App description (بالإنجليزية والعربية)
- [ ] Categories & tags
- [ ] Content rating questionnaire

### Play Console Upload:

1. إنشاء App في [Google Play Console](https://play.google.com/console)
2. Upload APK/AAB في "Internal testing" أولاً
3. اختبار مع Beta testers
4. Promote إلى Production عند الجاهزية

---

## 📈 Monitoring & Analytics

### Integrate Firebase:

```bash
# تثبيت Firebase plugin
npm install @capacitor-firebase/analytics

# تكوين google-services.json
# android/app/google-services.json
```

### Crash Reporting:

```typescript
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

// Log crashes
FirebaseCrashlytics.crash({ message: 'Test crash' });
```

---

## 🎯 Performance Optimization

### للحصول على APK سريع:

1. **Enable Hermes** (React Native engine)
2. **Use code splitting** في Vite
3. **Lazy load** heavy components
4. **Optimize images** (WebP, compression)
5. **Cache API responses** (service worker)
6. **Remove console.log** في production

---

## 📝 Version Management

### تحديث Version لكل Release:

```bash
# 1. Update package.json
npm version patch  # 2.0.0 -> 2.0.1
npm version minor  # 2.0.1 -> 2.1.0
npm version major  # 2.1.0 -> 3.0.0

# 2. Update android/app/build.gradle
versionCode 201  # increment
versionName "2.0.1"  # match package.json

# 3. Build
./build-apk.sh
```

---

## 🔗 مصادر مفيدة

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Vite Build Options](https://vitejs.dev/guide/build.html)
- [APK Signing Guide](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)

---

## ✅ Checklist نهائي

قبل بناء APK للنشر:

- [ ] ✅ `.env.production` configured correctly
- [ ] ✅ VITE_API_URL points to production server
- [ ] ✅ versionCode incremented
- [ ] ✅ versionName matches package.json
- [ ] ✅ Logo updated (if needed)
- [ ] ✅ Tested on physical device
- [ ] ✅ No console errors
- [ ] ✅ API calls working
- [ ] ✅ Authentication working
- [ ] ✅ APK signed with release keystore
- [ ] ✅ File size acceptable (<15 MB)
- [ ] ✅ ProGuard/R8 enabled
- [ ] ✅ Permissions documented

---

**آخر تحديث**: 5 يناير 2026  
**الإصدار**: 2.0.0  
**الحالة**: ✅ **Production Ready** 🚀
