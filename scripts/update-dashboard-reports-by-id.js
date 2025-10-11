const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  }
})

async function main() {
  console.log('🚀 Dashboard raporlarını güncelliyorum...\n')

  // RMK CIRO DASHBOARD - report_1760222244945_vafzbud7m
  try {
    const rmk = await prisma.reportConfig.update({
      where: { id: 'report_1760222244945_vafzbud7m' },
      data: {
        categoryId: 'dashboard-reports',
        showInMenu: true,
        updatedAt: new Date()
      }
    })
    console.log('✅ RMK CIRO DASHBOARD güncellendi:', rmk.name)
  } catch (error) {
    console.log('❌ RMK raporu bulunamadı (report_1760222244945_vafzbud7m)')
  }

  // BELPAS CIRO DASHBOARD - report_1760222160315_qdt2axzbj
  try {
    const belpas = await prisma.reportConfig.update({
      where: { id: 'report_1760222160315_qdt2axzbj' },
      data: {
        categoryId: 'dashboard-reports',
        showInMenu: true,
        updatedAt: new Date()
      }
    })
    console.log('✅ BELPAS CIRO DASHBOARD güncellendi:', belpas.name)
  } catch (error) {
    console.log('❌ BELPAS raporu bulunamadı (report_1760222160315_qdt2axzbj)')
  }

  // Kontrol
  console.log('\n📋 Dashboard Raporları kategorisindeki raporlar:')
  const dashboardReports = await prisma.reportConfig.findMany({
    where: { categoryId: 'dashboard-reports' },
    select: {
      id: true,
      name: true,
      showInMenu: true,
      isActive: true
    }
  })

  dashboardReports.forEach((report, index) => {
    console.log(`  ${index + 1}. ${report.name}`)
    console.log(`     ID: ${report.id}`)
    console.log(`     showInMenu: ${report.showInMenu}`)
  })

  console.log('\n✅ İşlem tamamlandı!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

