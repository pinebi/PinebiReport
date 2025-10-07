const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMehmeterdoganReports() {
  try {
    console.log('🔄 Updating mehmeterdogan report assignments...\n');

    // 1. Get mehmeterdogan user
    const mehmeterdogan = await prisma.user.findFirst({
      where: { username: 'mehmeterdogan' }
    });

    if (!mehmeterdogan) {
      console.error('❌ mehmeterdogan user not found!');
      return;
    }

    console.log(`✅ Found user: ${mehmeterdogan.username} (${mehmeterdogan.id})`);
    console.log(`   Company ID: ${mehmeterdogan.companyId}`);
    console.log(`   Role: ${mehmeterdogan.role}\n`);

    // 2. Get BELPAS company
    const belpasCompany = await prisma.company.findFirst({
      where: { 
        name: { contains: 'BELPAS' }
      }
    });

    if (!belpasCompany) {
      console.error('❌ BELPAS company not found!');
      return;
    }

    console.log(`✅ Found company: ${belpasCompany.name} (${belpasCompany.id})\n`);

    // 3. Get all BELPAS reports with showInMenu=true and isActive=true
    const belpasReports = await prisma.reportConfig.findMany({
      where: {
        companyId: belpasCompany.id,
        isActive: true,
        showInMenu: true
      },
      include: {
        category: true
      }
    });

    console.log(`📊 Found ${belpasReports.length} BELPAS reports with showInMenu=true and isActive=true:`);
    belpasReports.forEach(r => {
      console.log(`   - ${r.name} (${r.category?.name || 'No category'})`);
    });
    console.log('');

    // 4. Delete existing assignments
    const deleteResult = await prisma.reportUsers.deleteMany({
      where: { userId: mehmeterdogan.id }
    });

    console.log(`🗑️  Deleted ${deleteResult.count} existing assignments\n`);

    // 5. Create new assignments
    let createdCount = 0;
    for (const report of belpasReports) {
      await prisma.reportUsers.create({
        data: {
          userId: mehmeterdogan.id,
          reportId: report.id
        }
      });
      createdCount++;
    }

    console.log(`✅ Created ${createdCount} new assignments\n`);

    // 6. Verify assignments
    const assignments = await prisma.reportUsers.findMany({
      where: { userId: mehmeterdogan.id },
      include: {
        report: {
          include: {
            category: true,
            company: true
          }
        }
      }
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('📋 FINAL REPORT ASSIGNMENTS FOR MEHMETERDOGAN:');
    console.log('═══════════════════════════════════════════════════');
    assignments.forEach((a, i) => {
      console.log(`${i + 1}. ${a.report.name}`);
      console.log(`   Company: ${a.report.company?.name || 'N/A'}`);
      console.log(`   Category: ${a.report.category?.name || 'N/A'}`);
      console.log(`   Active: ${a.report.isActive}`);
      console.log(`   Show in Menu: ${a.report.showInMenu}`);
      console.log('');
    });
    console.log('═══════════════════════════════════════════════════');

    console.log('\n✅ Done! mehmeterdogan report assignments updated successfully.');
    console.log('\n📝 Next steps:');
    console.log('1. Login as mehmeterdogan');
    console.log('2. Open F12 -> Console');
    console.log('3. Run: sessionStorage.clear()');
    console.log('4. Refresh page (F5)');
    console.log('5. Check Raporlar menu');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMehmeterdoganReports();

