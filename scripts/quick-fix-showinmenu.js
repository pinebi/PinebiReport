const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickFix() {
  try {
    console.log('🔄 Quick fix - updating all reports...\n');

    // Get all reports first
    const reports = await prisma.reportConfig.findMany();
    console.log(`📊 Found ${reports.length} reports\n`);

    // Update each one with raw SQL
    await prisma.$executeRaw`UPDATE ReportConfigs SET showInMenu = 1`;
    
    console.log('✅ All reports updated to showInMenu = true\n');

    // Verify
    const updated = await prisma.reportConfig.findMany({
      select: {
        name: true,
        company: { select: { name: true } }
      },
      take: 5
    });

    console.log('📋 Sample reports:');
    updated.forEach(r => {
      console.log(`   - ${r.name} (${r.company?.name})`);
    });

    console.log('\n✅ Done! Tarayıcıyı yenileyin (F5)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix();

