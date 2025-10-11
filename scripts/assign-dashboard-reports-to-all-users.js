const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  }
})

async function main() {
  console.log('🚀 Dashboard raporlarını tüm kullanıcılara atıyorum...\n')

  // Dashboard raporlarının ID'leri
  const dashboardReportIds = [
    'rapor-dashboard-page',
    'satis-analiz-dashboard-page', 
    'karsilastirma-modu-page'
  ]

  // Tüm kullanıcıları al
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      companyId: true
    }
  })

  console.log(`📋 ${users.length} kullanıcı bulundu`)

  // Her kullanıcı için her dashboard raporunu ata
  for (const user of users) {
    console.log(`\n👤 ${user.firstName} ${user.lastName} (${user.username}) için raporlar atanıyor...`)
    
    for (const reportId of dashboardReportIds) {
      try {
        await prisma.reportUsers.create({
          data: {
            userId: user.id,
            reportId: reportId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`  ✅ ${reportId} atandı`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ℹ️ ${reportId} zaten atanmış`)
        } else {
          console.log(`  ❌ ${reportId} hatası:`, error.message)
        }
      }
    }
  }

  // Kontrol
  console.log('\n📊 Atama sonuçları:')
  for (const reportId of dashboardReportIds) {
  const count = await prisma.reportUsers.count({
    where: { reportId: reportId }
  })
    console.log(`  ${reportId}: ${count} kullanıcıya atandı`)
  }

  console.log('\n✅ İşlem tamamlandı!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
