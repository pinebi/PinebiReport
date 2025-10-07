// Update all reports to showInMenu = true
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating all reports to showInMenu = true...')
  
  // Get current state
  const allReports = await prisma.reportConfig.findMany({
    select: {
      id: true,
      name: true,
      showInMenu: true,
      isActive: true
    }
  })
  
  console.log(`📊 Found ${allReports.length} reports`)
  console.log(`✅ Active reports: ${allReports.filter(r => r.isActive).length}`)
  console.log(`📋 showInMenu true: ${allReports.filter(r => r.showInMenu).length}`)
  console.log(`❌ showInMenu false: ${allReports.filter(r => !r.showInMenu).length}`)
  
  // Update all to showInMenu = true
  const result = await prisma.reportConfig.updateMany({
    data: {
      showInMenu: true
    }
  })
  
  console.log(`\n✅ Updated ${result.count} reports to showInMenu = true`)
  
  // Verify
  const updated = await prisma.reportConfig.findMany({
    where: {
      showInMenu: true
    }
  })
  
  console.log(`\n📊 Final state:`)
  console.log(`✅ Reports with showInMenu = true: ${updated.length}`)
  
  // Show some examples
  console.log(`\n📋 Example reports:`)
  updated.slice(0, 5).forEach(r => {
    console.log(`  - ${r.name} (${r.isActive ? 'Active' : 'Inactive'})`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
