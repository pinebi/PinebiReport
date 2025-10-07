# Rapor Filtreleme Sistemi

## 📋 Genel Bakış

Kullanıcıların görebileceği raporlar şu kriterlere göre filtrelenir:

### ✅ Filtreleme Kriterleri

1. **Şirket Eşleşmesi** (`companyId`)
   - Kullanıcının şirketi = Rapor şirketi
   - Örnek: `mehmeterdogan` (BELPAS) → sadece BELPAS raporları

2. **Kullanıcı Ataması** (`ReportUsers`)
   - Rapor, kullanıcıya açıkça atanmış olmalı
   - `ReportUsers` tablosunda `userId` ile `reportId` ilişkisi bulunmalı

3. **Menüde Gösterim** (`showInMenu`)
   - Rapor çalıştırma sayfasında (`/reports/run`) kullanılır
   - `showInMenu = true` olan raporlar menüde görünür
   - Yönetim sayfasında (`/reports`) bu kontrol yapılmaz

4. **Aktiflik** (`isActive`)
   - Rapor aktif olmalı (`isActive = true`)

---

## 🔐 Rol Bazlı Erişim

### Admin Kullanıcılar
```typescript
// Tüm aktif ve menüde gösterilen raporları görür
where: { 
  isActive: true,
  showInMenu: true
}
```

### Normal Kullanıcılar
```typescript
// Şirket + kullanıcı ataması + menü + aktif
where: { 
  isActive: true,
  showInMenu: true,
  companyId: user.companyId,
  reportUsers: {
    some: {
      userId: user.id
    }
  }
}
```

---

## 📊 Database Şeması

### ReportConfigs Tablosu
```sql
CREATE TABLE ReportConfigs (
  id NVARCHAR(50) PRIMARY KEY,
  name NVARCHAR(255),
  companyId NVARCHAR(50),
  isActive BIT DEFAULT 1,
  showInMenu BIT DEFAULT 1,  -- YENİ ALAN
  ...
)
```

### ReportUsers Tablosu (Çoklu Kullanıcı Ataması)
```sql
CREATE TABLE ReportUsers (
  id NVARCHAR(50) PRIMARY KEY,
  reportId NVARCHAR(50),
  userId NVARCHAR(50),
  createdAt DATETIME2,
  updatedAt DATETIME2,
  UNIQUE (reportId, userId)
)
```

---

## 🛠️ Kullanım Örnekleri

### Örnek 1: Mehmeterdogan için BELPAS Raporları

**Durum:**
- Kullanıcı: `mehmeterdogan`
- Şirket: `BELPAS`
- Rapor: `Satış Raporu Belpas`

**Gereksinimler:**
1. ✅ Rapor şirketi = BELPAS
2. ✅ `ReportUsers` tablosunda ilişki var
3. ✅ `showInMenu = true`
4. ✅ `isActive = true`

**SQL ile Kontrol:**
```sql
SELECT 
    r.name as RaporAdi,
    c.name as Sirket,
    r.showInMenu,
    r.isActive,
    COUNT(ru.userId) as AtananKullaniciSayisi
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId
WHERE c.name LIKE '%BELPAS%'
GROUP BY r.id, r.name, c.name, r.showInMenu, r.isActive;
```

### Örnek 2: Kullanıcıya Rapor Atama

**Prisma Studio ile:**
1. `http://localhost:5555` adresini açın
2. `ReportUsers` tablosunu seçin
3. "Add record" butonuna tıklayın
4. Alanları doldurun:
   - `reportId`: Rapor ID
   - `userId`: Kullanıcı ID
5. Kaydedin

**SQL ile:**
```sql
-- Mehmeterdogan'a BELPAS raporlarını ata
INSERT INTO ReportUsers (id, reportId, userId, createdAt, updatedAt)
SELECT 
    LOWER(NEWID()),
    r.id,
    u.id,
    GETDATE(),
    GETDATE()
FROM ReportConfigs r
CROSS JOIN Users u
WHERE r.companyId IN (SELECT id FROM Companies WHERE name LIKE '%BELPAS%')
  AND u.username = 'mehmeterdogan'
  AND NOT EXISTS (
    SELECT 1 FROM ReportUsers ru 
    WHERE ru.reportId = r.id AND ru.userId = u.id
  );
```

---

## 🔍 Hata Ayıklama

### Rapor Görünmüyor?

**Kontrol Listesi:**

1. **Şirket Kontrolü**
```sql
SELECT u.username, u.companyId, c.name as company_name
FROM Users u
LEFT JOIN Companies c ON u.companyId = c.id
WHERE u.username = 'mehmeterdogan';
```

2. **Rapor Kontrolü**
```sql
SELECT r.name, r.companyId, c.name as company_name, r.isActive, r.showInMenu
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
WHERE r.name LIKE '%Belpas%';
```

3. **Kullanıcı Ataması Kontrolü**
```sql
SELECT 
    u.username,
    r.name as report_name,
    ru.createdAt as atanma_tarihi
FROM ReportUsers ru
JOIN Users u ON ru.userId = u.id
JOIN ReportConfigs r ON ru.reportId = r.id
WHERE u.username = 'mehmeterdogan';
```

4. **Tüm Kriterler Birlikte**
```sql
SELECT 
    r.name as RaporAdi,
    c.name as RaporSirketi,
    u.username as Kullanici,
    u2.name as KullaniciSirketi,
    r.isActive as Aktif,
    r.showInMenu as MenudeGoster,
    CASE 
        WHEN ru.id IS NOT NULL THEN 'ATANMIŞ'
        ELSE 'ATANMAMIŞ'
    END as AtamaDurumu
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN Companies u2 ON r.companyId = u2.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId AND ru.userId = (
    SELECT id FROM Users WHERE username = 'mehmeterdogan'
)
LEFT JOIN Users u ON ru.userId = u.id
WHERE r.name LIKE '%Belpas%';
```

---

## 📝 Frontend Kod Örnekleri

### Reports Run Page (`app/reports/run/page.tsx`)
```typescript
// Non-admin filtreleme
filteredReports = filteredReports.filter((report: any) => {
  const isActive = report.isActive
  const isShowInMenu = report.showInMenu !== false
  const isCompanyMatch = user.companyId === report.companyId
  const isUserAssigned = report.reportUsers?.some((ru: any) => ru.userId === user.id)
  
  return isActive && isShowInMenu && isCompanyMatch && isUserAssigned
})
```

### Database Query (`lib/database.ts`)
```typescript
// Prisma query
return prisma.reportConfig.findMany({
  where: { 
    isActive: true,
    showInMenu: true,
    companyId: companyId,
    reportUsers: {
      some: {
        userId: userId
      }
    }
  },
  include: { 
    category: true, 
    company: true, 
    user: true,
    reportUsers: true 
  }
})
```

---

## 🚀 Deployment

### 1. Veritabanı Güncellemesi
```bash
npx prisma db push
```

### 2. Kullanıcı-Rapor İlişkilerini Ekle
```bash
# SQL script çalıştır
sqlcmd -S your-server -d your-db -i scripts/add-report-users.sql
```

### 3. Uygulama Restart
```bash
npm run build
npm run start
```

---

## ✅ Test Senaryoları

### Senaryo 1: Mehmeterdogan Login
1. `mehmeterdogan` kullanıcısı ile login olun
2. `/reports/run` sayfasına gidin
3. Sadece BELPAS raporlarını görmelisiniz
4. Raporlar `showInMenu = true` olanlar olmalı

### Senaryo 2: Admin Login
1. Admin kullanıcısı ile login olun
2. `/reports/run` sayfasına gidin
3. Tüm `showInMenu = true` raporları görmelisiniz

### Senaryo 3: Rapor Atama
1. Yeni bir rapor oluşturun (BELPAS şirketi için)
2. `showInMenu = true` olarak işaretleyin
3. `ReportUsers` tablosuna `mehmeterdogan` için kayıt ekleyin
4. Kullanıcı login olduğunda raporu görmeli

---

## 📞 Destek

Sorun yaşarsanız:
1. Console log'ları kontrol edin (F12)
2. Veritabanı sorgularını çalıştırın
3. Prisma Studio'da (`http://localhost:5555`) verileri inceleyin

