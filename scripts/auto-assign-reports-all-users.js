const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function autoAssignReportsToAllUsers() {
  try {
    console.log('🔄 Auto-assigning reports to all non-admin users...\n');

    // 1. Get all non-admin users
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        isActive: true
      },
      include: {
        company: true
      }
    });

    console.log(`👥 Found ${users.length} non-admin users:\n`);
    users.forEach(u => {
      console.log(`   - ${u.username} (${u.role}) - Company: ${u.company?.name || 'No company'}`);
    });
    console.log('');

    // 2. Get all active reports with showInMenu=true
    const allReports = await prisma.reportConfig.findMany({
      where: {
        isActive: true,
        showInMenu: true
      },
      include: {
        company: true,
        category: true
      }
    });

    console.log(`📊 Found ${allReports.length} active reports with showInMenu=true\n`);

    // 3. Delete all existing ReportUsers assignments (except for admins)
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    const adminUserIds = adminUsers.map(u => u.id);

    const deleteResult = await prisma.reportUsers.deleteMany({
      where: {
        userId: { notIn: adminUserIds }
      }
    });

    console.log(`🗑️  Deleted ${deleteResult.count} existing non-admin assignments\n`);

    // 4. Assign reports to each user based on their company
    let totalAssignments = 0;
    const assignmentDetails = [];

    for (const user of users) {
      if (!user.companyId) {
        console.log(`⚠️  Skipping ${user.username} - No company assigned`);
        continue;
      }

      // Get reports for this user's company
      const userReports = allReports.filter(report => report.companyId === user.companyId);

      if (userReports.length === 0) {
        console.log(`⚠️  No reports found for ${user.username} (${user.company?.name})`);
        continue;
      }

      // Assign all company reports to this user
      for (const report of userReports) {
        await prisma.reportUsers.create({
          data: {
            userId: user.id,
            reportId: report.id
          }
        });
        totalAssignments++;
      }

      assignmentDetails.push({
        username: user.username,
        role: user.role,
        company: user.company?.name || 'N/A',
        reportCount: userReports.length
      });

      console.log(`✅ ${user.username} (${user.role}): ${userReports.length} reports assigned from ${user.company?.name}`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ASSIGNMENT SUMMARY:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Users Processed: ${users.length}`);
    console.log(`Total Assignments Created: ${totalAssignments}`);
    console.log('');

    // 5. Show detailed assignments per user
    console.log('📊 Detailed Assignments:');
    console.log('═══════════════════════════════════════════════════');
    for (const detail of assignmentDetails) {
      console.log(`${detail.username} (${detail.role})`);
      console.log(`   Company: ${detail.company}`);
      console.log(`   Reports: ${detail.reportCount}`);
      console.log('');
    }

    // 6. Verify assignments with report details
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 VERIFICATION - Reports per User:');
    console.log('═══════════════════════════════════════════════════');
    
    for (const user of users.slice(0, 3)) { // Show first 3 users for verification
      const assignments = await prisma.reportUsers.findMany({
        where: { userId: user.id },
        include: {
          report: {
            include: {
              category: true,
              company: true
            }
          }
        }
      });

      console.log(`\n👤 ${user.username} (${user.role}) - ${user.company?.name}`);
      console.log(`   Assigned Reports (${assignments.length}):`);
      assignments.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.report.name}`);
        console.log(`      Category: ${a.report.category?.name || 'N/A'}`);
        console.log(`      Company: ${a.report.company?.name || 'N/A'}`);
        console.log(`      Active: ${a.report.isActive}, Show in Menu: ${a.report.showInMenu}`);
      });
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ AUTO-ASSIGNMENT COMPLETED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📝 Next steps for testing:');
    console.log('1. Login with any non-admin user');
    console.log('2. Open F12 -> Console');
    console.log('3. Run: sessionStorage.clear()');
    console.log('4. Refresh page (F5)');
    console.log('5. Check Raporlar menu - should show company reports only');
    console.log('');
    console.log('🎯 Assignment Rules:');
    console.log('- Admin users: See all reports (no filtering)');
    console.log('- REPORTER users: See their company reports (via ReportUsers)');
    console.log('- USER role: See their company reports (via ReportUsers)');
    console.log('- All reports must have: isActive=true AND showInMenu=true');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoAssignReportsToAllUsers();

