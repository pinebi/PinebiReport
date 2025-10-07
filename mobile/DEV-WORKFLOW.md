# 🚀 ModernERP Android Development Workflow

## 📱 Development Mode (Önerilen)

Bu projede **API routes** kullanıldığı için, development mode'da çalışmanız önerilir.

### Nasıl Çalışır?
- Android app → `http://10.0.2.2:3000` (local Next.js server)
- Tüm API routes çalışır ✅
- Hot reload destekler ✅
- Database bağlantısı çalışır ✅

---

## 🔧 Development Setup

### 1. Next.js Dev Server Başlat
```bash
# Terminal 1
npm run dev
```

### 2. Android Studio'da Aç
```bash
# Terminal 2
npm run cap:open
```

### 3. Android'de Çalıştır
Android Studio'da:
- **Run** → **Run 'app'** (Shift + F10)
- Emulator veya fiziksel cihaz seçin
- Uygulama açılacak ve `http://10.0.2.2:3000` adresine bağlanacak

---

## 🔄 Kod Değişikliği Sonrası

### Senaryo 1: Sadece UI Değişikliği
- Next.js hot reload otomatik çalışır
- Android'de **Pull to refresh** (aşağı çek)
- Veya tarayıcıyı yenile

### Senaryo 2: API Route Değişikliği
- Next.js otomatik yeniden başlar
- Android'de app'i yenile

### Senaryo 3: Capacitor Config Değişikliği
```bash
npx cap sync android
```

### Senaryo 4: Native Plugin Ekleme
```bash
npm install @capacitor/camera
npx cap sync android
npm run cap:open
```

---

## 📱 Emulator vs Fiziksel Cihaz

### Emulator (Tavsiye Edilir)
```
✅ 10.0.2.2 → localhost
✅ Hızlı test
✅ Debug kolay
```

**Android Studio → Tools → AVD Manager → Create Virtual Device**

### Fiziksel Cihaz
```
❌ 10.0.2.2 çalışmaz
✅ Bilgisayarınızın IP adresi kullanın
   Örnek: http://192.168.1.100:3000
```

**capacitor.config.ts** değiştir:
```typescript
server: {
  url: 'http://192.168.1.100:3000',  // Bilgisayarınızın IP
  cleartext: true
}
```

---

## 🐛 Debug

### Chrome DevTools (Remote Debugging)
1. Android'de app'i başlat
2. Chrome'da: `chrome://inspect`
3. Cihazınızı seçin
4. **Inspect** tıklayın
5. Console, Network, Elements göreceksiniz!

### Android Studio Logcat
- **View** → **Tool Windows** → **Logcat**
- `ModernERP` filtresi uygulayın
- Console.log çıktılarını görün

### VS Code Terminal
```bash
npm run dev
```
API route log'ları burada görünür.

---

## 📦 Production Build (Gelecekte)

Bu proje API routes kullandığı için, production'da şu seçenekler var:

### Seçenek 1: Standalone Server + Android
```bash
# Next.js standalone server
npm run build
npm run start

# Capacitor production config
# capacitor.config.ts → url: 'https://your-server.com'
npx cap sync android
```

### Seçenek 2: Serverless Deploy
- Vercel/Netlify'da deploy et
- Android app → deployed URL

### Seçenek 3: Static + Client-Side API
- API calls'ı client-side yap
- Static export kullan
- Sadece frontend Android'de

---

## 🛠️ Yararlı Komutlar

```bash
# Development
npm run dev                 # Next.js dev server
npm run cap:open           # Android Studio aç

# Sync
npm run cap:sync           # Capacitor sync
npm run android:sync       # Sync + Open

# Clean
npx cap sync android       # Force sync
cd android && ./gradlew clean  # Gradle clean

# Info
npx cap doctor             # Capacitor health check
```

---

## ⚙️ Android App Permissions

**android/app/src/main/AndroidManifest.xml** kontrol edin:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Cleartext traffic (HTTP için) -->
<application
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

---

## 🎯 Network Security Config

**android/app/src/main/res/xml/network_security_config.xml:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

---

## ✅ Checklist

Uygulama çalışmıyor mu? Kontrol edin:

- [ ] Next.js dev server çalışıyor mu? (`http://localhost:3000`)
- [ ] capacitor.config.ts → url: `http://10.0.2.2:3000`
- [ ] AndroidManifest.xml → `usesCleartextTraffic="true"`
- [ ] Emulator kullanıyorsunuz? (10.0.2.2 sadece emulator'de çalışır)
- [ ] Chrome inspect'te console hatası var mı?
- [ ] Android Logcat'te hata var mı?

---

## 🎉 İlk Başarılı Build!

Tebrikler! Android uygulmanız çalışıyor! 🚀

**Şimdi yapabilecekleriniz:**
1. UI değişiklikleri yapın → Hot reload
2. API endpoints test edin
3. Capacitor plugins ekleyin (Camera, Geolocation, etc.)
4. Native features kullanın
5. Google Play'e yayınlayın!

---

## 📚 Kaynak

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer**: https://developer.android.com
- **Next.js Docs**: https://nextjs.org/docs

