import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default company
  const defaultCompany = await prisma.company.upsert({
    where: { code: 'DEFAULT' },
    update: {},
    create: {
      name: 'Varsayılan Şirket',
      code: 'DEFAULT',
      address: 'Türkiye',
      phone: '+90 212 555 0000',
      email: 'info@company.com',
      taxNumber: '1234567890'
    }
  })

  console.log('✅ Default company created:', defaultCompany.name)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@company.com',
      firstName: 'Yönetici',
      lastName: 'Admin',
      password: 'admin',
      companyId: defaultCompany.id,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created:', adminUser.username)

  // Create reporter user
  const reporterUser = await prisma.user.upsert({
    where: { username: 'reporter' },
    update: {},
    create: {
      username: 'reporter',
      email: 'reporter@company.com',
      firstName: 'Rapor',
      lastName: 'Kullanıcısı',
      password: 'reporter',
      companyId: defaultCompany.id,
      role: 'REPORTER'
    }
  })

  console.log('✅ Reporter user created:', reporterUser.username)

  // Create report categories
  const salesCategory = await prisma.reportCategory.upsert({
    where: { id: 'sales-reports' },
    update: {},
    create: {
      id: 'sales-reports',
      name: 'Satış Raporları',
      description: 'Satış performansı ve analiz raporları',
      icon: '📊',
      color: '#3B82F6',
      sortOrder: 1
    }
  })

  const financeCategory = await prisma.reportCategory.upsert({
    where: { id: 'finance-reports' },
    update: {},
    create: {
      id: 'finance-reports',
      name: 'Finansal Raporlar',
      description: 'Muhasebe ve finansal analiz raporları',
      icon: '💰',
      color: '#8B5CF6',
      sortOrder: 2
    }
  })

  const inventoryCategory = await prisma.reportCategory.upsert({
    where: { id: 'inventory-reports' },
    update: {},
    create: {
      id: 'inventory-reports',
      name: 'Stok Raporları',
      description: 'Envanter ve stok yönetim raporları',
      icon: '📦',
      color: '#06B6D4',
      sortOrder: 3
    }
  })

  console.log('✅ Report categories created')

  // Create subcategories
  await prisma.reportCategory.upsert({
    where: { id: 'monthly-sales' },
    update: {},
    create: {
      id: 'monthly-sales',
      name: 'Aylık Satış',
      description: 'Aylık satış performans raporları',
      parentId: salesCategory.id,
      icon: '📈',
      color: '#10B981',
      sortOrder: 1
    }
  })

  await prisma.reportCategory.upsert({
    where: { id: 'daily-sales' },
    update: {},
    create: {
      id: 'daily-sales',
      name: 'Günlük Satış',
      description: 'Günlük satış detay raporları',
      parentId: salesCategory.id,
      icon: '📅',
      color: '#F59E0B',
      sortOrder: 2
    }
  })

  console.log('✅ Report subcategories created')

  // Create sample report configs
  await prisma.reportConfig.upsert({
    where: { id: 'monthly-sales-report' },
    update: {},
    create: {
      id: 'monthly-sales-report',
      name: 'Aylık Satış Raporu',
      description: 'Aylık satış performans analizi',
      endpointUrl: 'https://api.erp.com/reports/monthly-sales',
      apiUsername: 'report_user',
      apiPassword: 'secure_pass',
      headers: JSON.stringify({ 'Content-Type': 'application/json' }),
      categoryId: salesCategory.id,
      companyId: defaultCompany.id,
      userId: adminUser.id
    }
  })

  await prisma.reportConfig.upsert({
    where: { id: 'daily-sales-report' },
    update: {},
    create: {
      id: 'daily-sales-report',
      name: 'Günlük Satış Detayı',
      description: 'Günlük satış detay raporu',
      endpointUrl: 'https://api.erp.com/reports/daily-sales',
      apiUsername: 'report_user',
      apiPassword: 'secure_pass',
      headers: JSON.stringify({ 'Content-Type': 'application/json' }),
      categoryId: salesCategory.id,
      companyId: defaultCompany.id,
      userId: reporterUser.id
    }
  })

  await prisma.reportConfig.upsert({
    where: { id: 'financial-report' },
    update: {},
    create: {
      id: 'financial-report',
      name: 'Gelir-Gider Analizi',
      description: 'Aylık gelir-gider karşılaştırma raporu',
      endpointUrl: 'https://api.erp.com/reports/income-expense',
      apiUsername: 'finance_user',
      apiPassword: 'finance_pass',
      headers: JSON.stringify({ 'Content-Type': 'application/json', 'X-Report-Type': 'financial' }),
      categoryId: financeCategory.id,
      companyId: defaultCompany.id,
      userId: adminUser.id
    }
  })

  // Add "Tarih Detaylı Faturalı Satış Raporu" for dashboard company click
  await prisma.reportConfig.upsert({
    where: { id: 'detailed-invoice-sales-report' },
    update: {},
    create: {
      id: 'detailed-invoice-sales-report',
      name: 'Tarih Detaylı Faturalı Satış Raporu',
      description: 'Firma bazında detaylı faturalı satış raporu',
      endpointUrl: 'http://api.pinebi.com:8191/REST.PROXY',
      apiUsername: 'PINEBI',
      apiPassword: 'q81ymAbtx1jJ8hoc8IPU79LjPemuXjok2NXYRTa51',
      headers: JSON.stringify({ 
        'url': 'http://31.145.34.232:8190/REST.CIRO.RAPOR.TARIH.FATURALI' 
      }),
      categoryId: salesCategory.id,
      companyId: defaultCompany.id,
      userId: adminUser.id
    }
  })

  console.log('✅ Sample report configs created')

  // Create API configs
  await prisma.apiConfig.upsert({
    where: { id: 'main-erp-api' },
    update: {},
    create: {
      id: 'main-erp-api',
      name: 'Ana ERP API',
      description: 'Ana ERP sisteminin API yapılandırması',
      baseUrl: 'https://api.erp.com/v1',
      version: '1.0',
      authenticationType: 'BEARER',
      authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      defaultHeaders: JSON.stringify({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0'
      }),
      timeout: 30000,
      retryCount: 3
    }
  })

  console.log('✅ API configs created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })


