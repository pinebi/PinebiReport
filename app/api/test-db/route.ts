import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test if Users table exists and get sample data
    const userCount = await prisma.user.count()
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true
      }
    })
    
    // Check if UserGridSettings table exists
    let userGridSettingsExists = false
    let gridSettingsCount = 0
    
    try {
      gridSettingsCount = await prisma.userGridSettings.count()
      userGridSettingsExists = true
    } catch (error) {
      console.log('UserGridSettings table does not exist yet')
    }

    return NextResponse.json({
      success: true,
      database: 'PinebiWebReport',
      connection: 'OK',
      userCount,
      sampleUsers,
      userGridSettingsExists,
      gridSettingsCount,
      message: userGridSettingsExists 
        ? 'UserGridSettings tablosu mevcut ve kullanıma hazır!'
        : 'UserGridSettings tablosu henüz oluşturulmamış. Manuel SQL çalıştırmanız gerekiyor.'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database bağlantı hatası',
      database: 'PinebiWebReport'
    }, { status: 500 })
  }
}



















