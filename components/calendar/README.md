# 📅 Takvim ve Proje Yönetimi - Yeni Özellikler

## 🚀 Eklenen Özellikler

### 1. **Görsel Takvim Görünümü** ✅
- **Dosya**: `calendar-view.tsx`
- **Özellikler**:
  - Aylık görünüm (klasik takvim)
  - Haftalık görünüm (saat bazlı)
  - Günlük görünüm (detaylı zaman çizelgesi)
  - Drag & drop ile etkinlik taşıma
  - Renk kodlama
  - Etkinlik önizleme

### 2. **Akıllı Bildirim Sistemi** ✅
- **Dosya**: `notification-settings.tsx`
- **Özellikler**:
  - Email bildirimleri
  - WhatsApp bildirimleri
  - SMS bildirimleri
  - Push notifications
  - Özelleştirilebilir zamanlar (5 dk, 15 dk, 1 saat, 1 gün önce)
  - Çoklu bildirim kanalları

### 3. **Rapor Otomasyonu** ✅
- **Dosya**: `report-automation.tsx`
- **Özellikler**:
  - Otomatik rapor zamanlaması (günlük, haftalık, aylık)
  - Çoklu alıcı desteği
  - Format seçimi (PDF, Excel, CSV)
  - Anında çalıştırma
  - Son çalıştırma ve sonraki çalıştırma tarihleri
  - Aktif/Pasif durumu

### 4. **Toplantı Yönetimi** ✅
- **Dosya**: `meeting-manager.tsx`
- **Özellikler**:
  - Katılımcı yönetimi
  - Kabul/Red durumu takibi
  - Gündem (agenda) yönetimi
  - Toplantı notları
  - Video konferans linkleri
  - Oda rezervasyonu entegrasyonu

### 5. **Oda Rezervasyon Sistemi** ✅
- **Dosya**: `room-reservation.tsx`
- **Özellikler**:
  - Müsait oda görüntüleme
  - Kapasite kontrolü
  - Ekipman ve olanaklar listesi
  - Mevcut rezervasyon görüntüleme
  - Anlık rezervasyon yapma

### 6. **Kanban Board** ✅
- **Dosya**: `kanban-board.tsx`
- **Özellikler**:
  - Drag & drop görev taşıma
  - Yapılacak / Devam Ediyor / İnceleme / Tamamlandı kolonları
  - Öncelik seviyeleri
  - Atanan kişi
  - Son tarih takibi
  - Etiket sistemi
  - Yorum sayısı gösterimi

### 7. **Gantt Chart** ✅
- **Dosya**: `gantt-chart.tsx`
- **Özellikler**:
  - Proje zaman çizelgesi
  - Görev bağımlılıkları
  - İlerleme yüzdesi
  - Milestone (kilometre taşı) gösterimi
  - Ay/hafta bazlı görünüm
  - Hafta sonu vurgulama
  - Bugün göstergesi

### 8. **AI Zamanlama Asistanı** ✅
- **Dosya**: `ai-scheduler.tsx`
- **Özellikler**:
  - Doğal dil işleme ("Yarın saat 3'te toplantı")
  - Akıllı zamanlama önerileri
  - Çakışma kontrolü
  - Otomatik kategori önerisi
  - Örnek sorgular
  - Anlık etkinlik oluşturma

### 9. **Takvim Analizi** ✅
- **Dosya**: `calendar-analytics.tsx`
- **Özellikler**:
  - Saatlere göre toplantı yoğunluğu
  - Günlere göre dağılım
  - Etkinlik türü analizi
  - Tamamlanma oranı trendi
  - AI öngörüleri ve öneriler
  - KPI kartları

### 10. **Ekip Müsaitliği** ✅
- **Dosya**: `team-availability.tsx`
- **Özellikler**:
  - Saat bazlı müsaitlik matrisi
  - Müsait/Meşgul/Belirsiz/Ofis Dışı durumları
  - Etkinlik detayları (hover tooltip)
  - En uygun saat önerisi
  - Takım özeti

### 11. **Google/Outlook Entegrasyonu** ✅
- **Dosya**: `calendar-sync.tsx`
- **Özellikler**:
  - Google Calendar bağlantısı
  - Outlook Calendar bağlantısı
  - İki yönlü senkronizasyon
  - iCalendar (.ics) export/import
  - Otomatik senkronizasyon
  - Senkronizasyon istatistikleri

## 📡 API Endpoint'leri

### Bildirim API'leri
- `POST /api/notifications/settings` - Bildirim ayarlarını kaydet
- `GET /api/notifications/settings?userId=X` - Ayarları getir
- `POST /api/whatsapp/send` - WhatsApp mesajı gönder
- `POST /api/email/send` - Email gönder
- `POST /api/sms/send` - SMS gönder

### Rapor Otomasyonu
- `POST /api/reports/scheduled/run` - Zamanlanmış raporu çalıştır

### Takvim Senkronizasyonu
- `POST /api/calendar/sync/google` - Google Calendar senkronizasyonu
- `POST /api/calendar/sync/outlook` - Outlook Calendar senkronizasyonu

## 🎯 Kullanım

### Takvim Sayfası
`/calendar` sayfasını açın ve 10 farklı sekme görürsünüz:

1. **Takvim**: Ay/Hafta/Gün görünümleri
2. **AI**: Doğal dille etkinlik oluşturma
3. **Ekip**: Ekip müsaitlik matrisi
4. **Toplantı**: Toplantı yönetimi
5. **Odalar**: Oda rezervasyonu
6. **Kanban**: Görev panosu
7. **Gantt**: Proje zaman çizelgesi
8. **Otomasyon**: Rapor zamanlaması
9. **Analiz**: İstatistikler ve grafikler
10. **Ayarlar**: Bildirimler ve entegrasyonlar

## 🔧 Konfigürasyon

### WhatsApp Business API
1. Facebook Developer Console'da app oluşturun
2. WhatsApp Business API'yi aktifleştirin
3. `.env` dosyasına ekleyin:
```env
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_ID=your_phone_id_here
```

### Google Calendar API
1. Google Cloud Console'da proje oluşturun
2. Calendar API'yi aktifleştirin
3. OAuth 2.0 credentials oluşturun
4. `.env` dosyasına ekleyin:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/sync/google/callback
```

### Outlook Calendar API
1. Azure Portal'da app registration yapın
2. Microsoft Graph API permissions ekleyin (Calendars.ReadWrite)
3. `.env` dosyasına ekleyin:
```env
OUTLOOK_CLIENT_ID=your_client_id
OUTLOOK_CLIENT_SECRET=your_client_secret
OUTLOOK_REDIRECT_URI=http://localhost:3000/api/calendar/sync/outlook/callback
```

### Email (SMTP)
`.env` dosyasına ekleyin:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### SMS (Twilio)
`.env` dosyasına ekleyin:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 📊 Özellik Detayları

### Drag & Drop
- Takvim görünümünde etkinlikleri sürükleyip başka tarihlere taşıyın
- Kanban board'da görevleri sütunlar arasında taşıyın

### AI Zamanlama
Doğal dil ile etkinlik oluşturun:
- "Yarın saat 14:00'da satış toplantısı"
- "Gelecek Pazartesi 09:00'da haftalık rapor"
- "15 Ekim tüm gün proje kickoff"

### Rapor Otomasyonu
- Haftalık satış raporunu her Pazartesi 09:00'da otomatik gönder
- Aylık ciro raporunu her ayın 1'inde gönder
- Anında çalıştırma özelliği

### Toplantı Özellikleri
- Katılımcı ekle/çıkar
- Kabul/Red durumu
- Gündem yönetimi (checkbox ile işaretleme)
- Toplantı notları
- Video konferans linki

### Ekip Müsaitliği
- Saat bazlı müsaitlik görünümü
- 4 durum: Müsait, Meşgul, Belirsiz, Ofis Dışı
- Hover ile etkinlik detayları
- En uygun toplantı saati önerisi

## 🎨 UI/UX Özellikleri

- Responsive tasarım (mobil uyumlu)
- Dark mode desteği
- Renk kodlama
- İkonlar
- Badge'ler
- Tooltip'ler
- Loading states
- Empty states

## 🔜 Gelecek Geliştirmeler

- [ ] Tekrarlayan etkinlikler (recurring events)
- [ ] Çakışma uyarıları
- [ ] Takvim paylaşımı
- [ ] Zaman dilimi desteği
- [ ] Mobil app entegrasyonu
- [ ] Slack entegrasyonu
- [ ] Microsoft Teams entegrasyonu
- [ ] Zoom entegrasyonu
- [ ] Konum bazlı hatırlatmalar
- [ ] QR kod check-in sistemi



