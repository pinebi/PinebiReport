const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixShowInMenu() {
  try {
    console.log('🔄 Fixing all showInMenu values...\n');

    // Update all reports to showInMenu = true
    const result = await prisma.reportConfig.updateMany({
      where: {
        OR: [
          { showInMenu: false },
          { showInMenu: null }
        ]
      },
      data: {
        showInMenu: true
      }
    });

    console.log(`✅ Updated ${result.count} reports to showInMenu = true\n`);

    // Verify all reports
    const allReports = await prisma.reportConfig.findMany({
      select: {
        id: true,
        name: true,
        showInMenu: true,
        isActive: true,
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ALL REPORTS - showInMenu STATUS:');
    console.log('═══════════════════════════════════════════════════');
    
    allReports.forEach((report, i) => {
      const status = report.showInMenu ? '✅' : '❌';
      const activeStatus = report.isActive ? '✅' : '❌';
      console.log(`${i + 1}. ${status} ${report.name}`);
      console.log(`   Company: ${report.company?.name || 'N/A'}`);
      console.log(`   Active: ${activeStatus}, Show in Menu: ${report.showInMenu}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Reports: ${allReports.length}`);
    console.log(`Show in Menu: ${allReports.filter(r => r.showInMenu).length}`);
    console.log(`Active: ${allReports.filter(r => r.isActive).length}`);
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixShowInMenu();

