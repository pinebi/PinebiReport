# Pinebi Report

Modern ve gelişmiş raporlama sistemi. Firma, kullanıcı ve raporları yönetmek için kapsamlı bir çözüm.

## Özellikler

### 🏢 Firma Yönetimi
- Firma ekleme, düzenleme ve silme
- Grid ve Pivot görünümleri
- Arama ve filtreleme
- Detaylı firma bilgileri (kod, ad, adres, telefon, e-posta, vergi no)

### 👥 Kullanıcı Yönetimi
- Kullanıcı ekleme, düzenleme ve silme
- Firma bazlı kullanıcı yönetimi
- Rol bazlı yetkilendirme (Admin, Kullanıcı, Görüntüleyici)
- Aktif/Pasif durum yönetimi

### 📊 Rapor Yönetimi
- API bağlantı yapılandırması
- Endpoint URL tanımlama
- API kullanıcı adı ve şifresi
- Özel Header bilgileri
- Firma ve kullanıcı bazlı rapor tanımları

### 📈 Gelişmiş Görünümler
- **Grid Görünümü**: Tablo formatında veri görüntüleme
- **Pivot Görünümü**: Analitik veri görüntüleme ve gruplama
- Sütun filtreleme ve sıralama
- Sayfalama ve arama

## Teknolojiler

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **AG Grid** - Gelişmiş tablo komponenti
- **Lucide React** - İkonlar
- **React Hook Form** - Form yönetimi

### Backend & Database
- **Prisma ORM** - Database ORM
- **SQL Server** - Veritabanı (PinebiWebReport)
- **REST API** - Backend API endpoints
- **Authentication** - Rol bazlı erişim kontrolü

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Ortam değişkenlerini ayarlayın:
`.env.local` dosyası oluşturun (örnek değerler, gerçek bilgilerinizi girin):
```env
# SQL Server bağlantısı (örnek)
DATABASE_URL="sqlserver://<host>:<port>;database=<dbname>;user=<user>;password=<password>;trustServerCertificate=true;encrypt=true"

# NextAuth / JWT gizli anahtarlar
NEXTAUTH_SECRET="replace-with-strong-random-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="replace-with-strong-random-secret"
```

3. Veritabanını hazırlayın:
```bash
npx prisma generate
npx prisma db push
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Kurulum sayfasını ziyaret edin:
`http://localhost:3000/setup` - Veritabanı bağlantısını test edin

6. Sisteme giriş yapın:
`http://localhost:3000/login` - Giriş sayfası

## Kullanım

### Ana Panel
- Sistem ana sayfasından üç temel modüle erişim
- Firma, Kullanıcı ve Rapor yönetimi kartları

### Firma Yönetimi (`/companies`)
- Yeni firma ekleme
- Mevcut firmaları düzenleme
- Firma silme işlemleri
- Grid/Pivot görünüm değiştirme

### Kullanıcı Yönetimi (`/users`)
- Kullanıcı ekleme ve düzenleme
- Firma ataması
- Rol belirleme
- Durum yönetimi

### Rapor Yönetimi (`/reports`)
- API bağlantı detayları
- Header bilgileri yapılandırması
- Firma ve kullanıcı bazlı rapor tanımlama

## Proje Yapısı

```
├── app/                    # Next.js App Router
│   ├── companies/         # Firma yönetimi sayfası
│   ├── users/            # Kullanıcı yönetimi sayfası
│   ├── reports/          # Rapor yönetimi sayfası
│   ├── globals.css       # Global stiller
│   ├── layout.tsx        # Ana layout
│   └── page.tsx          # Ana sayfa
├── components/
│   ├── shared/
│   │   └── data-grid.tsx # Paylaşılan grid komponenti
│   └── ui/               # UI komponentleri
├── types/
│   └── index.ts          # TypeScript tip tanımları
└── README.md
```

## Özelleştirme

Sistem kolayca özelleştirilebilir:
- Yeni alanlar eklenebilir
- API entegrasyonu yapılabilir
- Veritabanı bağlantısı eklenebilir
- Yetkilendirme sistemi geliştirilebilir
