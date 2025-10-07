# 🚀 YENİ ÖZELLİKLER - Kullanım Kılavuzu

## 📋 İçindekiler
1. [Sesli Komutlar & Rapor Okuma](#1-sesli-komutlar)
2. [Tema & Renk Kişiselleştirme](#2-tema-kişiselleştirme)
3. [Akıllı Dashboard Asistanı (Chatbot)](#3-ai-asistan)
4. [Karşılaştırma Modu](#4-karşılaştırma-modu)
5. [Rapor Şablonları & Tasarımcı](#5-rapor-tasarımcı)
6. [WhatsApp Entegrasyonu](#6-whatsapp)

---

## 1. 🎤 Sesli Komutlar & Rapor Okuma

### Nasıl Kullanılır?
1. **Sağ alt köşedeki mikrofon butonuna tıklayın** 🎙️
2. Aşağıdaki komutları söyleyin:
   - "Anasayfa" → Dashboard'a git
   - "Raporlar" → Raporlar sayfasına git
   - "Ayarlar" → Ayarlar sayfasına git
   - "Kullanıcılar" → Kullanıcı yönetimine git
   - "Yardım" → Yardım sayfasına git

### Sesli Rapor Okuma
- Herhangi bir rapor sayfasında **hoparlör butonuna** tıklayın 🔊
- Rapor içeriği size sesli olarak okunacak

### Teknik Detaylar
- **Dosya:** `hooks/use-voice-commands.ts`
- **Component:** `components/ui/voice-control-button.tsx`
- **Browser Support:** Chrome, Edge, Safari (Web Speech API)

---

## 2. 🎨 Tema & Renk Kişiselleştirme

### Nasıl Kullanılır?
1. **Menü → Yeni Özellikler → Tema Kişiselleştirme**
2. Aşağıdaki ayarları yapabilirsiniz:

#### Tema Modu
- ☀️ Aydınlık
- 🌙 Karanlık
- 📜 Sepia (Göz dostu)
- ⚫ Yüksek Kontrast

#### Renk Seçimi
- Ana renk seçici ile dashboard renklerini değiştirin
- Önceden tanımlı renk paletleri

#### Erişilebilirlik
- **Font Boyutu:** 12px - 24px arası
- **Animasyon Hızı:** Yavaş / Normal / Hızlı
- **Hareket Azaltma:** Animasyonları kapat
- **Renk Körlüğü Modu:**
  - Protanopi (Kırmızı-yeşil)
  - Deuteranopi (Yeşil-kırmızı)
  - Tritanopi (Mavi-sarı)

### Ayarlar Nereye Kaydedilir?
- **LocalStorage:** `theme-settings`
- Tarayıcı kapansa bile ayarlar kalır

### Teknik Detaylar
- **Dosya:** `components/theme/advanced-theme-customizer.tsx`
- **Sayfa:** `app/theme-custom/page.tsx`

---

## 3. 🤖 Akıllı Dashboard Asistanı (Chatbot)

### Nasıl Kullanılır?
1. **Sağ alt köşedeki chatbot butonuna tıklayın** 💬
2. Sorularınızı doğal dille sorun:

#### Örnek Sorular
```
"Bugünkü satışlar nasıl?"
→ Bugünkü satış özetini gösterir

"Bu hafta nasıl gitti?"
→ Haftalık performans raporu

"Excel olarak rapor oluştur"
→ Excel rapor indirilir

"Geçen aya göre nasıl?"
→ Karşılaştırmalı analiz
```

### Hızlı Eylemler
Chatbot penceresinde hazır butonlar:
- 📈 Bugünkü satışlar
- 📊 Excel rapor
- 📅 Bu hafta özet

### Teknik Detaylar
- **Dosya:** `components/ai/dashboard-chatbot.tsx`
- **Yapay Zeka:** Pattern matching (Gelecekte OpenAI entegrasyonu eklenebilir)

---

## 4. 📊 Karşılaştırma Modu (Side-by-Side)

### Nasıl Kullanılır?
1. **Menü → Yeni Özellikler → Karşılaştırma Modu**
2. İki farklı dönem seçin:
   - **Dönem 1:** Örn. 2024 (Tüm yıl)
   - **Dönem 2:** Örn. 2025 (Tüm yıl)
3. **Karşılaştır** butonuna tıklayın

### Ne Gösterir?
- ✅ Yan yana grafik karşılaştırması
- ✅ Yüzdelik değişim
- ✅ Toplam ciro farkı
- ✅ Trend analizi (Yükseliş/Düşüş)

### Örnek Kullanım Senaryoları
- 📅 Bu yıl vs Geçen yıl
- 📅 Bu ay vs Geçen ay
- 📅 Q1 2025 vs Q1 2024
- 📅 İki farklı firma karşılaştırma

### Teknik Detaylar
- **Sayfa:** `app/comparison/page.tsx`
- **API:** `/api/dashboard` (Tarih filtreli)

---

## 5. 🎨 Rapor Şablonları & Tasarımcı

### Nasıl Kullanılır?
1. **Menü → Yeni Özellikler → Rapor Tasarımcı**
2. Rapor adı girin
3. İstediğiniz widget'ları sürükle-bırak:
   - 📊 Bar Chart
   - 🥧 Pie Chart
   - 📈 Line Chart
   - 📋 Table (Tablo)

### Widget Ekleme
- Sol taraftan widget seçin
- Sağ tarafta önizleme görün
- İstediğiniz kadar widget ekleyin

### Kaydetme
- **Kaydet** butonuna tıklayın
- Şablon kaydedilir ve daha sonra kullanılabilir

### Gelecek Özellikler (TODO)
- [ ] Drag & Drop ile widget yerleştirme
- [ ] Renk/boyut kişiselleştirme
- [ ] Şablon kütüphanesi
- [ ] Şablon paylaşma

### Teknik Detaylar
- **Sayfa:** `app/report-designer/page.tsx`
- **API:** (Gelecekte eklenecek)

---

## 6. 📱 WhatsApp Entegrasyonu

### Nasıl Kullanılır?
1. Herhangi bir rapor sayfasında **"WhatsApp'a Gönder"** butonuna tıklayın
2. Telefon numarası girin (Örn: 532 123 45 67)
3. Mesaj yazın
4. **Gönder**

### Özellikler
- ✅ Raporları WhatsApp ile paylaş
- ✅ Otomatik bildirimler (İsteğe bağlı)
- ✅ Türkiye telefon numarası formatı (+90)

### Entegrasyon (Production için)

#### Twilio ile Kullanım
`.env.local` dosyasına ekleyin:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### API Endpoint
- **Dosya:** `app/api/whatsapp/send/route.ts`
- **Method:** POST
- **Body:**
```json
{
  "phoneNumber": "5321234567",
  "message": "Rapor mesajı",
  "reportData": { "name": "Satış Raporu" }
}
```

### Twilio Alternatifi
- **WhatsApp Business API** (Resmi)
- **Vonage/Nexmo**
- **MessageBird**

### Teknik Detaylar
- **Component:** `components/features/whatsapp-notification.tsx`
- **API:** `app/api/whatsapp/send/route.ts`

---

## 🎯 Menü Yapısı

```
Ana Menü
├── Dashboard
├── Raporlar
│   ├── Rapor Çalıştır
│   ├── Rapor Yönetimi
│   └── Kategoriler
├── Analiz
│   ├── Gelişmiş Analiz
│   └── Performans
├── Yönetim
│   ├── Kullanıcılar
│   ├── Şirketler
│   └── Sistem Ayarları
├── Araçlar
│   ├── Veri Dışa Aktarma
│   ├── Takvim
│   └── Bildirimler
└── YENİ ÖZELLİKLER 🆕
    ├── 🎤 Sesli Komutlar (Floating button)
    ├── 🤖 AI Asistan (Floating button)
    ├── 📊 Karşılaştırma Modu
    ├── 🎨 Rapor Tasarımcı
    ├── 🎨 Tema Kişiselleştirme
    └── 📱 WhatsApp Bildirim
```

---

## 🔧 Kurulum & Başlatma

### 1. Paketler Yüklü mü?
```bash
npm install
```

### 2. Yeni Bağımlılıklar (Opsiyonel)
```bash
npm install @radix-ui/react-slider
```

### 3. Dev Server Başlat
```bash
npm run dev
```

### 4. Tarayıcıda Aç
```
http://localhost:3000
```

---

## 📂 Dosya Yapısı

```
c:\ModernERP\Rapor\
├── app/
│   ├── comparison/
│   │   └── page.tsx               # Karşılaştırma sayfası
│   ├── report-designer/
│   │   └── page.tsx               # Rapor Tasarımcı
│   ├── theme-custom/
│   │   └── page.tsx               # Tema Kişiselleştirme
│   └── api/
│       └── whatsapp/
│           └── send/
│               └── route.ts       # WhatsApp API
│
├── components/
│   ├── ai/
│   │   └── dashboard-chatbot.tsx  # AI Chatbot
│   ├── features/
│   │   └── whatsapp-notification.tsx  # WhatsApp Component
│   ├── theme/
│   │   └── advanced-theme-customizer.tsx  # Tema Ayarları
│   └── ui/
│       ├── voice-control-button.tsx  # Sesli Komut Butonu
│       └── slider.tsx              # Slider Component
│
└── hooks/
    └── use-voice-commands.ts       # Sesli Komut Hook
```

---

## ⚡ Performans Notları

1. **Sesli Komutlar:** 
   - Sadece destekleyen tarayıcılarda çalışır
   - Chrome/Edge önerilir

2. **Chatbot:** 
   - Pattern matching kullanır (hafif)
   - Gelecekte AI entegrasyonu eklenebilir

3. **Tema Ayarları:** 
   - LocalStorage kullanır (hafif)
   - Sayfa yenilemeye dayanıklı

4. **WhatsApp:** 
   - Şu an simülasyon (production'da Twilio gerekir)

---

## 🔮 Gelecek Özellikler (Roadmap)

### Kısa Vadeli (1-2 Hafta)
- [ ] Sesli komutlara daha fazla komut ekleme
- [ ] Chatbot'a OpenAI entegrasyonu
- [ ] WhatsApp otomatik bildirimler
- [ ] Rapor Tasarımcı'da drag & drop

### Orta Vadeli (1-2 Ay)
- [ ] E-posta ile rapor gönderimi
- [ ] Zamanlı raporlar (Cron Jobs)
- [ ] Push notifications
- [ ] Gelişmiş AI analiz

### Uzun Vadeli (3+ Ay)
- [ ] Mobil uygulama (React Native)
- [ ] Gerçek zamanlı WebSocket
- [ ] Gamification (Rozetler/Liderboard)
- [ ] Multi-language support

---

## 🐛 Sorun Giderme

### Sesli Komutlar Çalışmıyor
```
✅ Chrome/Edge kullanıyor musunuz?
✅ Mikrofon izni verdiniz mi?
✅ HTTPS'de mi çalışıyorsunuz? (localhost hariç)
```

### Chatbot Açılmıyor
```
✅ Console'da hata var mı?
✅ Sayfayı yenileyip tekrar deneyin
```

### WhatsApp Gönderilmiyor
```
✅ Şu an simülasyon modu (console'da log göreceksiniz)
✅ Production için Twilio kurulumu gerekli
```

### Tema Ayarları Kayboldu
```
✅ LocalStorage temizlendi mi?
✅ Tarayıcı gizli modda mı?
```

---

## 📞 Destek & İletişim

**Geliştirici:** AI Assistant  
**Tarih:** 7 Ekim 2025  
**Versiyon:** 1.0.0

---

## 🎉 Keyifli Kullanımlar!

Tüm yeni özellikler mevcut altyapınızı bozmadan eklenmiştir.  
İstediğiniz zaman geri alabilir veya güncelleyebilirsiniz.

**GitHub Backup Commit ID:** "BACKUP: Current features before adding new ones"

