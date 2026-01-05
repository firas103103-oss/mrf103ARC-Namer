# Build APK محلياً (يتطلب تثبيت Android Studio)

## المتطلبات:
- Android Studio
- Android SDK (API 34+)
- Java JDK 17+

## الخطوات:

### 1. تثبيت Android Studio
قم بتحميل وتثبيت Android Studio من:
https://developer.android.com/studio

### 2. تكوين Android SDK
بعد التثبيت، افتح Android Studio وثبّت:
- Android SDK Platform 34
- Android SDK Build-Tools
- Android Emulator (اختياري)

### 3. تعيين متغير البيئة
```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (PowerShell)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
```

### 4. بناء APK
```bash
# بناء تطبيق الويب
npm run build

# مزامنة مع Android
npx cap sync android

# بناء Debug APK
cd android
./gradlew assembleDebug

# أو بناء Release APK (موقّع)
./gradlew assembleRelease
```

### 5. موقع APK
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

---

# البناء باستخدام GitHub Actions (سهل) ✅

تم إنشاء workflow في `.github/workflows/android-build.yml`

## كيفية الاستخدام:
1. Push التغييرات إلى GitHub
2. اذهب إلى "Actions" في GitHub
3. سيبنى APK تلقائياً
4. قم بتحميل APK من "Artifacts"

## أو تشغيل يدوي:
1. اذهب إلى GitHub → Actions
2. اختر "Build Android APK"
3. انقر "Run workflow"
4. انتظر 5-10 دقائق
5. حمّل APK من Artifacts

---

# استخدام EAS Build (Expo)

```bash
# تثبيت EAS CLI
npm install -g eas-cli

# تسجيل الدخول
eas login

# تهيئة EAS
eas build:configure

# بناء APK
eas build --platform android --profile preview
```

---

# خيارات إضافية:

## Appcircle
https://appcircle.io - بناء مجاني في السحابة

## Bitrise
https://www.bitrise.io - CI/CD للموبايل

## Codemagic
https://codemagic.io - بناء تلقائي للتطبيقات
