# 📱 ModernERP Android Uygulaması Kurulum Rehberi

## 🎯 Genel Bakış

Bu proje **Next.js** tabanlı bir web uygulamasını **Capacitor** kullanarak Android native uygulamasına dönüştürüyor.

### Teknolojiler:
- ✅ **Next.js 14** (Web App)
- ✅ **Capacitor 6** (Native Bridge)
- ✅ **Android Studio** (Build & Deploy)
- ✅ **PWA** (Progressive Web App features)

---

## 📋 Ön Gereksinimler

### 1. Node.js ve NPM
```bash
node --version  # v18.0.0 veya üzeri
npm --version   # v9.0.0 veya üzeri
```

### 2. Java Development Kit (JDK)
- **JDK 17** veya üzeri gerekli
- Download: https://adoptium.net/
- Kurulumdan sonra `JAVA_HOME` environment variable ayarlayın

### 3. Android Studio
- Download: https://developer.android.com/studio
- Kurulum sırasında şunları seçin:
  - ✅ Android SDK
  - ✅ Android SDK Platform
  - ✅ Android Virtual Device (AVD)

### 4. Android SDK ve Tools
Android Studio'da **SDK Manager** → Install:
- ✅ Android SDK Platform 33 (veya en son)
- ✅ Android SDK Build-Tools
- ✅ Android Emulator
- ✅ Google Play Services

### 5. Environment Variables (Windows)
```powershell
# JAVA_HOME
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"

# ANDROID_HOME
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# PATH'e ekle
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

---

## 🚀 Kurulum Adımları

### Adım 1: Capacitor Kurulumu
```bash
cd C:\ModernERP\Rapor

# Capacitor CLI ve Android platform
npm install @capacitor/core @capacitor/cli @capacitor/android

# Capacitor başlat
npx cap init "ModernERP" "com.modernerp.rapor" --web-dir=out
```

### Adım 2: Next.js Static Export Ayarları

**next.config.js** dosyasını güncelleyin:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export için
  images: {
    unoptimized: true,  // Image optimization kapat (static export için)
  },
  trailingSlash: true,  // Trailing slash ekle
}

module.exports = nextConfig
```

### Adım 3: Capacitor Konfigürasyonu

**capacitor.config.ts** oluşturun:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modernerp.rapor',
  appName: 'ModernERP',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Geliştirme için (local server):
    // url: 'http://10.0.2.2:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3B82F6",
      showSpinner: false,
    },
  },
};

export default config;
```

### Adım 4: Android Platformu Ekle
```bash
# Build static export
npm run build

# Android platformu ekle
npx cap add android

# Sync files
npx cap sync android
```

### Adım 5: Android Studio'da Aç
```bash
# Android Studio'yu aç
npx cap open android
```

---

## 📱 Android Build ve Deploy

### Geliştirme (Development) Build

**1. Emulator'da Çalıştır:**
```bash
# Build + sync + open
npm run build && npx cap sync android && npx cap open android
```

Android Studio'da:
- **Run** → **Run 'app'**
- Veya `Shift + F10`

**2. Fiziksel Cihazda Çalıştır:**
- Cihazda **Developer Options** → **USB Debugging** aktif
- USB ile bilgisayara bağla
- Android Studio'da cihazı seç
- **Run 'app'**

### Production Build (APK/AAB)

**1. Signing Key Oluştur:**
```bash
cd android/app
keytool -genkey -v -keystore modernerp-release.keystore -alias modernerp -keyalg RSA -keysize 2048 -validity 10000
```

Bilgileri kaydet:
- Keystore password: [şifre]
- Alias: modernerp
- Key password: [şifre]

**2. Signing Config:**

**android/app/build.gradle** → ekleyin:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('modernerp-release.keystore')
            storePassword 'your-keystore-password'
            keyAlias 'modernerp'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**3. APK Build:**
```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

**4. AAB Build (Google Play için):**
```bash
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🎨 Android App Customization

### 1. App Icon
**android/app/src/main/res/** altında:
- `mipmap-mdpi/` → 48x48
- `mipmap-hdpi/` → 72x72
- `mipmap-xhdpi/` → 96x96
- `mipmap-xxhdpi/` → 144x144
- `mipmap-xxxhdpi/` → 192x192

**Icon Generator:** https://icon.kitchen

### 2. Splash Screen
**android/app/src/main/res/drawable/** altında:
- `splash.png` ekleyin (2732x2732 veya 1080x1920)

**android/app/src/main/res/values/styles.xml:**
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@drawable/splash</item>
</style>
```

### 3. App Name ve Permissions

**android/app/src/main/AndroidManifest.xml:**
```xml
<manifest>
    <application
        android:label="ModernERP"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round">
        
        <!-- Internet permission -->
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
        
        <!-- Camera (if needed) -->
        <!-- <uses-permission android:name="android.permission.CAMERA" /> -->
        
        <!-- Storage (if needed) -->
        <!-- <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" /> -->
        <!-- <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /> -->
    </application>
</manifest>
```

---

## 🔧 Capacitor Plugins (Opsiyonel)

### Network Status
```bash
npm install @capacitor/network
npx cap sync
```

```typescript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log('Network status:', status.connected);
```

### Camera
```bash
npm install @capacitor/camera
npx cap sync
```

### Storage (Local)
```bash
npm install @capacitor/preferences
npx cap sync
```

### Push Notifications
```bash
npm install @capacitor/push-notifications
npx cap sync
```

### Geolocation
```bash
npm install @capacitor/geolocation
npx cap sync
```

---

## 🛠️ Development Workflow

### 1. Local Development
```bash
# Terminal 1: Next.js dev server
npm run dev

# capacitor.config.ts → uncomment:
# server: {
#   url: 'http://10.0.2.2:3000',
#   cleartext: true
# }

# Terminal 2: Sync ve aç
npx cap sync android && npx cap open android
```

### 2. Production Build
```bash
# Build Next.js
npm run build

# Sync Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK/AAB
cd android && ./gradlew assembleRelease
```

---

## 📦 Google Play Store Yayınlama

### 1. Google Play Console
- https://play.google.com/console
- Developer account oluştur ($25 one-time fee)

### 2. App Bundle Upload
- **Create App**
- **Production** → **Create new release**
- Upload `app-release.aab`
- Store listing bilgilerini doldur:
  - App name: ModernERP
  - Short description
  - Full description
  - Screenshots (phone + tablet)
  - Icon (512x512)
  - Feature graphic (1024x500)

### 3. Content Rating
- Questionnaire doldur

### 4. Pricing & Distribution
- Free / Paid seç
- Countries seç

### 5. Submit for Review
- Review süresi: 1-7 gün

---

## 🐛 Troubleshooting

### Problem: Android Studio bulunamıyor
```bash
# Android Studio path'i kontrol et
where android

# Environment variable düzelt
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
```

### Problem: Gradle build hatası
```bash
# Gradle cache temizle
cd android
./gradlew clean
./gradlew assembleDebug
```

### Problem: SSL/Network hatası
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application android:usesCleartextTraffic="true">
```

### Problem: White screen
```bash
# capacitor.config.ts → server URL'i kontrol et
# Static build yaptığınızdan emin olun
npm run build
npx cap sync android
```

---

## 📊 Build Scripts (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:android": "npm run build && npx cap sync android",
    "open:android": "npx cap open android",
    "android:dev": "npm run build:android && npm run open:android",
    "android:release": "cd android && ./gradlew assembleRelease"
  }
}
```

Kullanım:
```bash
npm run android:dev      # Development build
npm run android:release  # Production APK
```

---

## ✅ Checklist

### Before First Build:
- [ ] JDK 17+ kurulu
- [ ] Android Studio kurulu
- [ ] Android SDK kurulu
- [ ] Environment variables ayarlandı
- [ ] next.config.js → output: 'export'
- [ ] capacitor.config.ts oluşturuldu

### Before Production:
- [ ] App icon hazır (tüm boyutlar)
- [ ] Splash screen hazır
- [ ] Signing key oluşturuldu
- [ ] build.gradle signing config ayarlandı
- [ ] AndroidManifest.xml kontrol edildi
- [ ] Package name unique (com.modernerp.rapor)
- [ ] Version code/name güncellendi

### Before Google Play:
- [ ] Privacy policy URL
- [ ] App screenshots (min 2)
- [ ] Feature graphic (1024x500)
- [ ] Content rating tamamlandı
- [ ] Store listing tamamlandı
- [ ] AAB dosyası oluşturuldu

---

## 🎉 Sonuç

Artık Next.js projeniz Android native app olarak çalışıyor! 🚀

**Next Steps:**
1. `npm run android:dev` ile test edin
2. Emulator veya fiziksel cihazda çalıştırın
3. Production build alın: `npm run android:release`
4. Google Play'e yükleyin

**Destek:**
- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer: https://developer.android.com

