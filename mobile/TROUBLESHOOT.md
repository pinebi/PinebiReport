# 🐛 Android Connection Troubleshooting

## ✅ Yapılan Düzeltmeler:

### 1. **Network Security Config** ✅
`android/app/src/main/res/xml/network_security_config.xml`
- Cleartext traffic (HTTP) izni eklendi
- 10.0.2.2, localhost, 127.0.0.1 domain'leri eklendi

### 2. **AndroidManifest.xml** ✅
- `android:usesCleartextTraffic="true"` eklendi
- `android:networkSecurityConfig="@xml/network_security_config"` eklendi
- INTERNET permission zaten var ✅

### 3. **Capacitor Config** ✅
- URL: `http://10.0.2.2:3001` (Port 3001!)
- cleartext: true

---

## 📱 ŞİMDİ YAPIN:

### **1. Android Studio'da Clean Build:**
```
Build → Clean Project
(Bekleyin 10 saniye)
Build → Rebuild Project
(Bekleyin 1-2 dakika)
```

### **2. Emulator'ü Yeniden Başlatın:**
```
AVD Manager → Stop Emulator
AVD Manager → Start Emulator
```

### **3. Uygulamayı Çalıştırın:**
```
Run → Run 'app' (Shift + F10)
```

---

## 🔍 TEST ADIMLARı:

### **A. Next.js Server Kontrolü:**
Tarayıcıda: `http://localhost:3001`
✅ Dashboard açılıyor mu?

### **B. Emulator Network Testi:**
Emulator'de Chrome açın:
- `http://10.0.2.2:3001`
- Dashboard görünüyor mu?

### **C. Chrome DevTools:**
1. App başladıktan sonra
2. Chrome → `chrome://inspect`
3. Inspect → Console
4. Network hatalarını kontrol edin

---

## ❌ HALA ÇALIŞMIYORSA:

### **Seçenek 1: Emulator Yerine Fiziksel Cihaz**

**1. Bilgisayarın IP adresini bulun:**
```bash
ipconfig
# "IPv4 Address" not edin (örn: 192.168.1.100)
```

**2. capacitor.config.ts'yi düzenleyin:**
```typescript
server: {
  url: 'http://192.168.1.100:3001',  // Kendi IP'niz
  cleartext: true
}
```

**3. Sync + Run:**
```bash
npx cap sync android
```

**4. Cihazda:**
- Ayarlar → Geliştirici Seçenekleri → USB Debugging
- USB ile bağlayın
- Android Studio'da Run

---

### **Seçenek 2: Port 3000'i Kullan**

**1. Prisma Studio'yu Kapatın:**
```bash
# Prisma Studio terminal'de Ctrl+C
```

**2. Next.js'i yeniden başlatın:**
```bash
npm run dev
# Port 3000 kullanacak
```

**3. capacitor.config.ts:**
```typescript
url: 'http://10.0.2.2:3000'
```

**4. Sync:**
```bash
npx cap sync android
```

---

### **Seçenek 3: Production Build (Static)**

Bu yöntem API routes çalışmayacak ama UI'yi görebilirsiniz:

**1. next.config.js → output: 'export' ekleyin**

**2. Build:**
```bash
npm run build
```

**3. capacitor.config.ts:**
```typescript
webDir: 'out',
server: {
  // url yok - static files
}
```

**4. Sync:**
```bash
npx cap sync android
```

---

## 🎯 BEKLENEN SONUÇ:

✅ App başlar
✅ Beyaz ekran yerine loading gösterir
✅ Dashboard açılır
✅ Veriler gelir

---

## 📊 DEBUG LOG'LARI:

### **Android Logcat'te Görmek İstediğimiz:**
```
Capacitor: Loading app at http://10.0.2.2:3001
WebView: Connected successfully
Console: Dashboard loaded
```

### **Görmek İSTEMEDİĞİMİZ:**
```
ERR_CONNECTION_TIMED_OUT ❌
ERR_CLEARTEXT_NOT_PERMITTED ❌
net::ERR_CONNECTION_REFUSED ❌
```

---

## ✅ ÇÖZÜM KONTROL LİSTESİ:

- [ ] Next.js dev server çalışıyor (`http://localhost:3001`)
- [ ] AndroidManifest.xml → usesCleartextTraffic="true"
- [ ] network_security_config.xml oluşturuldu
- [ ] capacitor.config.ts → url: 'http://10.0.2.2:3001'
- [ ] npx cap sync android çalıştırıldı
- [ ] Clean + Rebuild yapıldı
- [ ] Emulator yeniden başlatıldı
- [ ] INTERNET permission var

---

## 🚀 BAŞARILI OLUNCA:

Tebrikler! Artık:
- ✅ Android'de ModernERP çalışıyor
- ✅ Gerçek API'lerden veri geliyor
- ✅ Database bağlantısı var
- ✅ Hot reload çalışıyor

---

## 📞 EK YARDIM:

**Capacitor Docs:**
https://capacitorjs.com/docs/android/troubleshooting

**Network Security Config:**
https://developer.android.com/training/articles/security-config

