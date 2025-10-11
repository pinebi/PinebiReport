const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  }
})

async function main() {
  console.log('🔍 Dashboard raporlarını arıyorum...\n')

  // Aranacak rapor isimleri
  const searchNames = [
    'Rapor Dashboard',
    'Satış Analiz Dashboard', 
    'Karşılaştırma Modu',
    'Dashboard',
    'Analytics',
    'Comparison'
  ]

  console.log('📋 Tüm raporlar:')
  const allReports = await prisma.reportConfig.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
      showInMenu: true,
      isActive: true
    },
    orderBy: { name: 'asc' }
  })

  allReports.forEach((report, index) => {
    console.log(`  ${index + 1}. ${report.name}`)
    console.log(`     ID: ${report.id}`)
    console.log(`     Kategori: ${report.categoryId}`)
    console.log(`     Menüde: ${report.showInMenu}`)
    console.log('')
  })

  // Dashboard ile ilgili raporları filtrele
  console.log('\n🎯 Dashboard ile ilgili raporlar:')
  const dashboardReports = allReports.filter(report => 
    report.name.toLowerCase().includes('dashboard') ||
    report.name.toLowerCase().includes('analiz') ||
    report.name.toLowerCase().includes('karşılaştırma') ||
    report.name.toLowerCase().includes('comparison')
  )

  dashboardReports.forEach((report, index) => {
    console.log(`  ${index + 1}. ${report.name}`)
    console.log(`     ID: ${report.id}`)
    console.log(`     Kategori: ${report.categoryId}`)
    console.log(`     Menüde: ${report.showInMenu}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
