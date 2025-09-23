import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, initializeDatabase } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Veritabanı bağlantısı başarısız' },
        { status: 500 }
      )
    }

    // Initialize database with seed data
    const isInitialized = await initializeDatabase()
    
    if (!isInitialized) {
      return NextResponse.json(
        { error: 'Veritabanı başlatma başarısız' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Veritabanı başarıyla bağlandı ve başlatıldı',
      connected: true,
      initialized: true
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Veritabanı başlatma hatası', details: error },
      { status: 500 }
    )
  }
}


