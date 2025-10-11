const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  }
})

async function main() {
  console.log('🚀 Dashboard sayfa raporlarını oluşturuyorum...\n')

  // 1. Rapor Dashboard
  try {
    const raporDashboard = await prisma.reportConfig.create({
        data: {
          id: 'rapor-dashboard-page',
          name: 'Rapor Dashboard',
          description: 'Ana rapor dashboard sayfası',
          endpointUrl: '/reports/dashboard',
          apiUsername: 'dashboard',
          apiPassword: 'dashboard',
          categoryId: 'dashboard-reports',
          showInMenu: true,
          isActive: true,
          companyId: 'cmfvnyk1t000ick2ann62skwj', // RMK company
          userId: 'cmfwy5o4z00019dnbn2m8pzt2',    // Admin user
          createdAt: new Date(),
          updatedAt: new Date()
        }
    })
    console.log('✅ Rapor Dashboard oluşturuldu:', raporDashboard.name)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Rapor Dashboard zaten mevcut, güncelleniyor...')
      await prisma.reportConfig.update({
        where: { id: 'rapor-dashboard-page' },
        data: {
          categoryId: 'dashboard-reports',
          showInMenu: true,
          updatedAt: new Date()
        }
      })
    } else {
      throw error
    }
  }

  // 2. Satış Analiz Dashboard
  try {
    const satisAnalizDashboard = await prisma.reportConfig.create({
        data: {
          id: 'satis-analiz-dashboard-page',
          name: 'Satış Analiz Dashboard',
          description: 'Satış analiz dashboard sayfası',
          endpointUrl: '/analytics',
          apiUsername: 'analytics',
          apiPassword: 'analytics',
          categoryId: 'dashboard-reports',
          showInMenu: true,
          isActive: true,
          companyId: 'cmfvnyk1t000ick2ann62skwj', // RMK company
          userId: 'cmfwy5o4z00019dnbn2m8pzt2',    // Admin user
          createdAt: new Date(),
          updatedAt: new Date()
        }
    })
    console.log('✅ Satış Analiz Dashboard oluşturuldu:', satisAnalizDashboard.name)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Satış Analiz Dashboard zaten mevcut, güncelleniyor...')
      await prisma.reportConfig.update({
        where: { id: 'satis-analiz-dashboard-page' },
        data: {
          categoryId: 'dashboard-reports',
          showInMenu: true,
          updatedAt: new Date()
        }
      })
    } else {
      throw error
    }
  }

  // 3. Karşılaştırma Modu
  try {
    const karsilastirmaModu = await prisma.reportConfig.create({
        data: {
          id: 'karsilastirma-modu-page',
          name: 'Karşılaştırma Modu',
          description: 'Karşılaştırma modu sayfası',
          endpointUrl: '/comparison',
          apiUsername: 'comparison',
          apiPassword: 'comparison',
          categoryId: 'dashboard-reports',
          showInMenu: true,
          isActive: true,
          companyId: 'cmfvnyk1t000ick2ann62skwj', // RMK company
          userId: 'cmfwy5o4z00019dnbn2m8pzt2',    // Admin user
          createdAt: new Date(),
          updatedAt: new Date()
        }
    })
    console.log('✅ Karşılaştırma Modu oluşturuldu:', karsilastirmaModu.name)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Karşılaştırma Modu zaten mevcut, güncelleniyor...')
      await prisma.reportConfig.update({
        where: { id: 'karsilastirma-modu-page' },
        data: {
          categoryId: 'dashboard-reports',
          showInMenu: true,
          updatedAt: new Date()
        }
      })
    } else {
      throw error
    }
  }

  // Kontrol
  console.log('\n📋 Dashboard Raporları kategorisindeki tüm raporlar:')
  const dashboardReports = await prisma.reportConfig.findMany({
    where: { categoryId: 'dashboard-reports' },
    select: {
      id: true,
      name: true,
      showInMenu: true,
      isActive: true,
      endpointUrl: true
    },
    orderBy: { name: 'asc' }
  })

  dashboardReports.forEach((report, index) => {
    console.log(`  ${index + 1}. ${report.name}`)
    console.log(`     ID: ${report.id}`)
    console.log(`     URL: ${report.endpointUrl || 'N/A'}`)
    console.log(`     Menüde: ${report.showInMenu}`)
    console.log('')
  })

  console.log('✅ İşlem tamamlandı!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
