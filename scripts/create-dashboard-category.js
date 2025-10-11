const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  }
})

async function main() {
  console.log('🚀 Dashboard kategori oluşturuluyor...\n')

  // 1. Kategori oluştur
  try {
    const category = await prisma.reportCategory.create({
      data: {
        id: 'dashboard-reports',
        name: 'Dashboard Raporları',
        description: 'Ana dashboard için kullanılan raporlar',
        icon: '📊',
        color: '#F59E0B',
        sortOrder: 0,
        isActive: true
      }
    })
    console.log('✅ Kategori oluşturuldu:', category.name)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Kategori zaten mevcut, devam ediliyor...')
    } else {
      throw error
    }
  }

  // 2. RMK CIRO DASHBOARD'u güncelle
  const rmkReport = await prisma.reportConfig.updateMany({
    where: { name: 'RMK CIRO DASHBOARD' },
    data: {
      categoryId: 'dashboard-reports',
      showInMenu: true,
      updatedAt: new Date()
    }
  })
  console.log('✅ RMK CIRO DASHBOARD güncellendi:', rmkReport.count, 'kayıt')

  // 3. BELPAS CIRO DASHBOARD'u güncelle
  const belpasReport = await prisma.reportConfig.updateMany({
    where: { name: 'BELPAS CIRO DASHBOARD' },
    data: {
      categoryId: 'dashboard-reports',
      showInMenu: true,
      updatedAt: new Date()
    }
  })
  console.log('✅ BELPAS CIRO DASHBOARD güncellendi:', belpasReport.count, 'kayıt')

  // 4. Satış Analiz Raporu'nu güncelle
  const salesReport = await prisma.reportConfig.updateMany({
    where: { name: 'Satış Analiz Raporu' },
    data: {
      categoryId: 'dashboard-reports',
      showInMenu: true,
      updatedAt: new Date()
    }
  })
  console.log('✅ Satış Analiz Raporu güncellendi:', salesReport.count, 'kayıt')

  // 5. Kontrol
  console.log('\n📋 Dashboard Raporları kategorisindeki raporlar:')
  const dashboardReports = await prisma.reportConfig.findMany({
    where: { categoryId: 'dashboard-reports' },
    select: {
      name: true,
      showInMenu: true,
      isActive: true
    }
  })

  dashboardReports.forEach((report, index) => {
    console.log(`  ${index + 1}. ${report.name} - showInMenu: ${report.showInMenu}`)
  })

  console.log('\n✅ İşlem tamamlandı!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

