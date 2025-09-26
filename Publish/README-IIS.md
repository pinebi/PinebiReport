# IIS Deployment Guide

## Gereksinimler

1. **Node.js** (v18 veya üzeri)
2. **iisnode** modülü
3. **IIS** (Windows Server)

## Kurulum Adımları

### 1. Node.js Kurulumu
- Node.js'i Windows Server'a kurun
- PATH'e eklendiğinden emin olun

### 2. iisnode Kurulumu
```bash
npm install -g iisnode
```

### 3. IIS Konfigürasyonu
1. IIS Manager'ı açın
2. Yeni bir site oluşturun
3. Physical path'i Publish klasörüne ayarlayın
4. Application pool'u Node.js için yapılandırın

### 4. Ortam Değişkenleri
1. `env.example` dosyasını `.env.local` olarak kopyalayın
2. Veritabanı bağlantı bilgilerini güncelleyin
3. Diğer gerekli değişkenleri ayarlayın

### 5. Bağımlılıkları Yükleyin
```bash
cd Publish
npm install --production
```

### 6. Veritabanını Hazırlayın
```bash
npx prisma generate
npx prisma db push
```

## Dosya Yapısı

```
Publish/
├── .next/                 # Next.js build dosyaları
├── lib/                   # Kütüphane dosyaları
├── prisma/                # Veritabanı şeması
├── server.js              # Node.js sunucu
├── web.config             # IIS konfigürasyonu
├── package.json           # Bağımlılıklar
├── .env.local             # Ortam değişkenleri
└── env.example            # Örnek ortam değişkenleri
```

## Sorun Giderme

- **Port çakışması**: `PORT` değişkenini kontrol edin
- **Veritabanı bağlantısı**: `.env.local` dosyasını kontrol edin
- **İzinler**: IIS_IUSRS kullanıcısına okuma/yazma izni verin








