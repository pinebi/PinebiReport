# Trusted Web Activity (TWA) - Android Kurulumu

## PWA'nızı Play Store'a Yükleyin

### 1. Bubblewrap ile TWA Oluşturma

```bash
# Bubblewrap CLI kurulumu
npm install -g @bubblewrap/cli

# TWA projesi oluşturma
bubblewrap init --manifest https://yourapp.com/manifest.json

# Android APK oluşturma
bubblewrap build

# Play Store için imzalı APK
bubblewrap build --release
```

### 2. Gereksinimler

- ✅ HTTPS zorunlu
- ✅ manifest.json (mevcut)
- ✅ Service Worker (mevcut)
- ✅ İkonlar (mevcut)
- ✅ Digital Asset Links doğrulaması

### 3. Digital Asset Links

`.well-known/assetlinks.json` dosyası oluşturun:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pinebi.report",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT"
    ]
  }
}]
```

### 4. Play Store Yayınlama

1. [Google Play Console](https://play.google.com/console) hesabı açın
2. Yeni uygulama oluşturun
3. APK/AAB dosyasını yükleyin
4. Store listing bilgilerini doldurun
5. Yayınlayın!

## Avantajları

- ✅ Hızlı geliştirme (1-2 gün)
- ✅ Tek kod tabanı
- ✅ Play Store'da görünürlük
- ✅ Otomatik güncellemeler
- ✅ Mevcut web uygulamanızı kullanır

## Dezavantajları

- ❌ Sadece Android
- ❌ iOS için alternatif gerekli
- ❌ Bazı native özellikler sınırlı

