import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, backupType = 'full' } = await request.json()

    console.log('💾 Auto Backup API Request:', { userId, companyId, backupType })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups')
    
    // Backup dizinini oluştur
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupData: any = {
      timestamp: new Date().toISOString(),
      userId,
      companyId,
      backupType,
      data: {}
    }

    // 1. Rapor konfigürasyonları
    if (backupType === 'full' || backupType === 'reports') {
      const reports = await prisma.reportConfig.findMany({
        where: {
          OR: [
            { userId: userId },
            { companyId: companyId }
          ]
        },
        include: {
          category: true,
          company: true,
          user: true
        }
      })
      backupData.data.reports = reports
    }

    // 2. Kullanıcı verileri
    if (backupType === 'full' || backupType === 'users') {
      const users = await prisma.user.findMany({
        where: {
          companyId: companyId
        }
      })
      backupData.data.users = users.map(user => ({
        ...user,
        password: '[REDACTED]' // Şifreleri güvenlik için gizle
      }))
    }

    // 3. Şirket bilgileri
    if (backupType === 'full' || backupType === 'companies') {
      const companies = await prisma.company.findMany({
        where: {
          id: companyId
        }
      })
      backupData.data.companies = companies
    }

    // 4. Rapor kategorileri
    if (backupType === 'full' || backupType === 'categories') {
      const categories = await prisma.reportCategory.findMany({
        where: {
          isActive: true
        }
      })
      backupData.data.categories = categories
    }

    // 5. Rapor çalıştırma geçmişi (son 30 gün)
    if (backupType === 'full' || backupType === 'executions') {
      const executions = await prisma.reportExecution.findMany({
        where: {
          userId: userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          report: {
            select: {
              name: true,
              categoryId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })
      backupData.data.executions = executions
    }

    // 6. Dashboard ayarları
    if (backupType === 'full' || backupType === 'settings') {
      const userSettings = await prisma.userReportSettings.findMany({
        where: {
          userId: userId
        }
      })
      backupData.data.userSettings = userSettings

      const gridSettings = await prisma.userGridSettings.findMany({
        where: {
          userId: userId
        }
      })
      backupData.data.gridSettings = gridSettings
    }

    // Backup dosyasını kaydet
    const backupFileName = `backup_${companyId}_${timestamp}.json`
    const backupFilePath = path.join(backupDir, backupFileName)
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2))

    // Backup kaydını veritabanına ekle
    try {
      await prisma.backupLog.create({
        data: {
          userId,
          companyId,
          backupType,
          fileName: backupFileName,
          filePath: backupFilePath,
          fileSize: fs.statSync(backupFilePath).size,
          status: 'completed',
          createdAt: new Date()
        }
      })
    } catch (dbError) {
      console.log('⚠️ BackupLog table not found, skipping log save')
    }

    // Eski backup dosyalarını temizle (30 günden eski)
    const files = fs.readdirSync(backupDir)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    files.forEach(file => {
      if (file.startsWith('backup_') && file.endsWith('.json')) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath)
          console.log('🗑️ Old backup file deleted:', file)
        }
      }
    })

    console.log('✅ Auto backup completed:', backupFileName)

    return NextResponse.json({
      success: true,
      backup: {
        fileName: backupFileName,
        filePath: backupFilePath,
        fileSize: fs.statSync(backupFilePath).size,
        recordCount: Object.keys(backupData.data).length,
        timestamp: backupData.timestamp
      }
    })

  } catch (error: any) {
    console.error('❌ Auto Backup API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const companyId = searchParams.get('companyId')

    console.log('📋 Backup List API Request:', { userId, companyId })

    const backupDir = path.join(process.cwd(), 'backups')
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        success: true,
        backups: []
      })
    }

    const files = fs.readdirSync(backupDir)
    const backups = files
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        
        return {
          fileName: file,
          fileSize: stats.size,
          createdAt: stats.mtime,
          modifiedAt: stats.mtime
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log('✅ Backup list retrieved:', backups.length, 'files')

    return NextResponse.json({
      success: true,
      backups
    })

  } catch (error: any) {
    console.error('❌ Backup List API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}


