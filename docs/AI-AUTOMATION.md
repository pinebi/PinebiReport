# AI & Otomasyon Merkezi

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Özellikler](#özellikler)
3. [API Endpoints](#api-endpoints)
4. [Kullanım Kılavuzu](#kullanım-kılavuzu)
5. [Teknik Detaylar](#teknik-detaylar)

---

## 🎯 Genel Bakış

AI & Otomasyon Merkezi, sistem yönetiminizi kolaylaştıran ve veri analizinizi güçlendiren 4 ana modülden oluşur:

- **🤖 Gelişmiş Chatbot** - Akıllı sohbet asistanı
- **💡 Akıllı Rapor Önerileri** - Kullanıcı davranışı analizi
- **⚠️ Anomali Tespiti** - Otomatik sorun algılama
- **💾 Otomatik Yedekleme** - Güvenli veri saklama

---

## 🚀 Özellikler

### 1. Gelişmiş Chatbot

#### Yetenekler:
- 📊 **Dashboard Veri Sorgulama**
  - "Bugünkü satışlar nasıl?"
  - "Bu hafta ciromuz ne kadar?"
  - "Müşteri sayımız kaç?"

- 🎯 **Akıllı Öneri Sistemi**
  - "Hangi raporları önerirsin?"
  - "Benzer raporlar var mı?"

- 🔍 **Sistem Kontrolü**
  - "Sistemde sorun var mı?"
  - "Veri kalitesi nasıl?"

#### Özellikler:
- ✅ Bağlam bazlı yanıtlar (Context-aware)
- ✅ Gerçek zamanlı veri entegrasyonu
- ✅ Kullanıcı davranış analizi
- ✅ Çoklu dil desteği hazır altyapı
- ✅ Chat geçmişi kaydı

---

### 2. Akıllı Rapor Önerileri

#### Öneri Tipleri:

##### 🔥 Yüksek Öncelik
**Kategori Bazlı Öneriler**
- Kullanıcının en çok kullandığı kategoriden raporlar
- Son 30 günlük kullanım geçmişi analizi
- En ilgili 3 rapor önerisi

##### 🌟 Orta Öncelik
**Benzer Raporlar**
- Son kullanılan raporlara benzer öneriler
- Aynı kategoriden farklı raporlar
- Kullanıcı tercihlerine göre filtreleme

**Yeni Raporlar**
- Son 7 günde eklenen raporlar
- Kullanıcının erişim yetkisi olan yenilikler

##### 📊 Düşük Öncelik
**Trend Analizi**
- Analiz ve karşılaştırma raporları
- Trend içeren raporlar

#### Algoritma:
```typescript
1. Kullanıcı geçmişini analiz et (son 30 gün)
2. En çok kullanılan kategorileri tespit et
3. Kullanılmayan raporları bul
4. Benzerlik skoruna göre sırala
5. Önceliklendirme yap
```

---

### 3. Anomali Tespiti Sistemi

#### Kontrol Edilen Alanlar:

##### 📉 Satış Anomalileri
**Tespit:**
- Günlük satışların normal seviyenin %50 altına düşmesi
- **Önem:** Yüksek
- **Öneri:** Satış ekibiyle görüşme

##### 📊 Veri Tutarsızlığı
**Tespit:**
- %10'dan fazla boş/null veri kaydı
- **Önem:** Orta
- **Öneri:** Veri kaynağı kontrolü

##### ⚡ Performans Sorunları
**Tespit:**
- 10 saniyeden uzun API yanıt süreleri
- **Önem:** Orta
- **Öneri:** Sunucu optimizasyonu

##### 📦 Veri Hacmi Sorunları
**Tespit:**
- Beklenen minimum veri sayısının altında
- **Önem:** Düşük
- **Öneri:** Veri kaynağı kontrolü

##### 📅 Tarih Aralığı Uyarıları
**Tespit:**
- 30 günden uzun veri aralığı
- **Önem:** Düşük
- **Öneri:** Daha kısa aralık kullanımı

#### Anomali Kayıt Sistemi:
```typescript
{
  type: 'sales_drop',
  severity: 'high' | 'medium' | 'low',
  title: 'Satış Düşüşü Tespit Edildi',
  description: 'Detaylı açıklama',
  recommendation: 'Çözüm önerisi',
  impact: 'Etki seviyesi',
  detectedAt: 'Tespit zamanı'
}
```

---

### 4. Otomatik Yedekleme Sistemi

#### Yedekleme Tipleri:

##### 🔵 Full Backup (Tam Yedek)
Tüm sistem verilerini yedekler:
- ✅ Rapor konfigürasyonları
- ✅ Kullanıcı verileri (şifreler hariç)
- ✅ Şirket bilgileri
- ✅ Rapor kategorileri
- ✅ Rapor çalıştırma geçmişi (son 30 gün)
- ✅ Dashboard ayarları
- ✅ Grid ayarları

##### 🟢 Özel Backup Tipleri
- **reports** - Sadece raporlar
- **users** - Sadece kullanıcılar
- **companies** - Sadece şirketler
- **categories** - Sadece kategoriler
- **executions** - Sadece çalıştırma geçmişi
- **settings** - Sadece ayarlar

#### Güvenlik:
- 🔒 Şifreler otomatik gizlenir ([REDACTED])
- 🗑️ 30 günden eski backup'lar otomatik silinir
- 📦 JSON formatında şifrelenmiş depolama
- 📝 Backup geçmişi veritabanında saklanır

#### Backup Dosya Yapısı:
```json
{
  "timestamp": "2025-10-08T12:00:00.000Z",
  "userId": "user-id",
  "companyId": "company-id",
  "backupType": "full",
  "data": {
    "reports": [...],
    "users": [...],
    "companies": [...],
    "categories": [...],
    "executions": [...],
    "userSettings": [...],
    "gridSettings": [...]
  }
}
```

---

## 🔌 API Endpoints

### 1. Smart Recommendations

**Endpoint:** `POST /api/ai/smart-recommendations`

**Request:**
```json
{
  "userId": "user-id",
  "companyId": "company-id",
  "userRole": "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "type": "category_based",
      "title": "Sık Kullandığınız Kategoriden",
      "description": "Satış Raporları kategorisinden yeni raporlar",
      "reports": [...],
      "priority": "high"
    }
  ],
  "userStats": {
    "totalAccess": 20,
    "topCategory": "sales-reports",
    "recentActivity": true
  }
}
```

---

### 2. Anomaly Detection

**Endpoint:** `POST /api/ai/anomaly-detection`

**Request:**
```json
{
  "userId": "user-id",
  "companyId": "company-id",
  "startDate": "2025-10-08",
  "endDate": "2025-10-08"
}
```

**Response:**
```json
{
  "success": true,
  "anomalies": [
    {
      "type": "sales_drop",
      "severity": "high",
      "title": "Satış Düşüşü Tespit Edildi",
      "description": "Günlük satışlar normal seviyenin %50 altında",
      "recommendation": "Satış ekibiyle görüşüp nedenleri araştırın",
      "impact": "Yüksek",
      "detectedAt": "2025-10-08T12:00:00.000Z"
    }
  ],
  "summary": {
    "total": 1,
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

---

### 3. Auto Backup

**Create Backup - Endpoint:** `POST /api/ai/auto-backup`

**Request:**
```json
{
  "userId": "user-id",
  "companyId": "company-id",
  "backupType": "full"
}
```

**Response:**
```json
{
  "success": true,
  "backup": {
    "fileName": "backup_company-id_2025-10-08T12-00-00.json",
    "filePath": "/path/to/backup",
    "fileSize": 1024000,
    "recordCount": 7,
    "timestamp": "2025-10-08T12:00:00.000Z"
  }
}
```

**List Backups - Endpoint:** `GET /api/ai/auto-backup`

**Query Params:**
- `userId` - Kullanıcı ID
- `companyId` - Şirket ID

**Response:**
```json
{
  "success": true,
  "backups": [
    {
      "fileName": "backup_company-id_2025-10-08T12-00-00.json",
      "fileSize": 1024000,
      "createdAt": "2025-10-08T12:00:00.000Z",
      "modifiedAt": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

---

### 4. Enhanced Chatbot

**Endpoint:** `POST /api/ai/enhanced-chatbot`

**Request:**
```json
{
  "message": "Bugünkü satışlar nasıl?",
  "userId": "user-id",
  "companyId": "company-id",
  "context": "general"
}
```

**Response:**
```json
{
  "success": true,
  "response": "📊 **RMK Firması Güncel Verileri:**\n\n💰 **Günlük Satış:** 150,000 TL...",
  "context": "dashboard",
  "actionType": "data_query",
  "hasData": true,
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

---

## 📖 Kullanım Kılavuzu

### Chatbot Kullanımı

1. **Dashboard'a Git:** `http://localhost:3000/ai-automation`
2. **Chatbot Sekmesini Seç**
3. **Soru Sor:** Mesaj kutusuna sorunuzu yazın
4. **Enter** veya **Gönder** butonuna basın

**Örnek Sorular:**
```
- Bugünkü satışlar nasıl?
- Bu hafta ciromuz ne kadar?
- Hangi raporları önerirsin?
- Sistemde sorun var mı?
```

---

### Akıllı Öneriler

1. **Öneriler Sekmesine Git**
2. **Yenile** butonuna basarak son önerileri getir
3. **Öneri Kartlarını** incele
4. **Rapor Linklerine** tıklayarak raporları aç

---

### Anomali Tespiti

1. **Anomali Sekmesine Git**
2. **Kontrol Et** butonuna bas
3. **Tespit Edilen Anomalileri** incele
4. **Önerileri** uygula

**Renk Kodları:**
- 🔴 **Kırmızı:** Yüksek öncelik
- 🟡 **Sarı:** Orta öncelik
- 🟢 **Yeşil:** Düşük öncelik

---

### Otomatik Yedekleme

1. **Backup Sekmesine Git**
2. **Backup Oluştur** butonuna bas
3. **Backup Listesini** incele
4. **Backup Bilgilerini** kontrol et

**Otomatik Temizlik:**
- 30 günden eski backup'lar otomatik silinir
- Manuel silme gerekmiyor

---

## 🔧 Teknik Detaylar

### Veritabanı Tabloları

#### AnomalyDetection (Opsiyonel)
```prisma
model AnomalyDetection {
  id             String   @id @default(cuid())
  userId         String
  companyId      String
  type           String
  severity       String
  title          String
  description    String
  recommendation String
  impact         String
  detectedAt     DateTime
  createdAt      DateTime @default(now())
}
```

#### BackupLog (Opsiyonel)
```prisma
model BackupLog {
  id         String   @id @default(cuid())
  userId     String
  companyId  String
  backupType String
  fileName   String
  filePath   String
  fileSize   Int
  status     String
  createdAt  DateTime @default(now())
}
```

#### ChatHistory (Opsiyonel)
```prisma
model ChatHistory {
  id         String   @id @default(cuid())
  userId     String
  companyId  String
  message    String
  response   String   @db.Text
  context    String
  actionType String
  createdAt  DateTime @default(now())
}
```

**Not:** Bu tablolar opsiyoneldir. Sistem, tablolar yoksa hata vermeden çalışır ve sadece loglama yapar.

---

### Performans Optimizasyonu

#### Caching Stratejisi:
- Dashboard verileri 5 dakika cache
- Rapor önerileri 10 dakika cache
- Anomali sonuçları 3 dakika cache

#### Timeout Yönetimi:
- Dashboard API: 90 saniye
- Chatbot API: 30 saniye
- Backup işlemi: Timeout yok

#### Veri Limitleri:
- Chat geçmişi: Son 20 mesaj
- Rapor geçmişi: Son 30 gün
- Backup saklama: 30 gün

---

### Güvenlik

#### API Güvenliği:
- ✅ Kullanıcı kimlik doğrulaması gerekli
- ✅ Şirket bazlı veri izolasyonu
- ✅ Rol tabanlı erişim kontrolü

#### Veri Güvenliği:
- ✅ Şifrelerin otomatik gizlenmesi
- ✅ Hassas verilerin loglanmaması
- ✅ Güvenli dosya depolama

---

### Hata Yönetimi

#### API Hataları:
```typescript
try {
  // API çağrısı
} catch (error) {
  console.error('API error:', error)
  return {
    success: false,
    error: error.message
  }
}
```

#### Frontend Hataları:
```typescript
try {
  // İşlem
} catch (error) {
  console.error('Frontend error:', error)
  // Kullanıcıya bilgi ver
}
```

---

## 🎨 UI/UX Özellikleri

### Tasarım Prensipleri:
- ✨ Modern ve minimalist tasarım
- 🎯 Kullanıcı dostu arayüz
- 🚀 Hızlı ve responsive
- 🌈 Renk kodlu öncelik sistemi
- 📱 Mobil uyumlu

### Animasyonlar:
- Smooth geçişler
- Loading states
- Hover effects
- Slide-in animations

---

## 🚀 Gelecek Geliştirmeler

### Planlar:
- [ ] OpenAI GPT entegrasyonu
- [ ] Sesli komut desteği
- [ ] E-posta bildirim sistemi
- [ ] WhatsApp entegrasyonu
- [ ] Telegram bot desteği
- [ ] Scheduled backup
- [ ] Backup restore özelliği
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] ML tabanlı tahminleme

---

## 📞 Destek

Herhangi bir sorun veya öneri için:
- **Email:** support@pinebi.com
- **Dokümantasyon:** `/docs/AI-AUTOMATION.md`

---

## 📝 Changelog

### v1.0.0 (2025-10-08)
- ✅ Gelişmiş Chatbot eklendi
- ✅ Akıllı Rapor Önerileri eklendi
- ✅ Anomali Tespiti sistemi eklendi
- ✅ Otomatik Yedekleme sistemi eklendi
- ✅ UI/UX iyileştirmeleri yapıldı

---

**Son Güncelleme:** 2025-10-08
**Versiyon:** 1.0.0
**Durum:** ✅ Aktif



