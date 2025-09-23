import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const reportId = searchParams.get('reportId')

    if (!userId || !reportId) {
      return NextResponse.json({ error: 'userId ve reportId gerekli' }, { status: 400 })
    }

    const settings = await prisma.userReportSettings.findUnique({
      where: {
        userId_reportId: {
          userId,
          reportId
        }
      },
      include: {
        user: true,
        report: true
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('User report settings fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı ayarları getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { userId, reportId, columnSettings, filterSettings, pivotSettings, viewType } = data

    if (!userId || !reportId) {
      return NextResponse.json({ error: 'userId ve reportId gerekli' }, { status: 400 })
    }

    const settings = await prisma.userReportSettings.upsert({
      where: {
        userId_reportId: {
          userId,
          reportId
        }
      },
      update: {
        columnSettings: columnSettings ? JSON.stringify(columnSettings) : null,
        filterSettings: filterSettings ? JSON.stringify(filterSettings) : null,
        pivotSettings: pivotSettings ? JSON.stringify(pivotSettings) : null,
        viewType: viewType || 'GRID',
        updatedAt: new Date()
      },
      create: {
        userId,
        reportId,
        columnSettings: columnSettings ? JSON.stringify(columnSettings) : null,
        filterSettings: filterSettings ? JSON.stringify(filterSettings) : null,
        pivotSettings: pivotSettings ? JSON.stringify(pivotSettings) : null,
        viewType: viewType || 'GRID'
      },
      include: {
        user: true,
        report: true
      }
    })

    return NextResponse.json({ settings }, { status: 201 })
  } catch (error) {
    console.error('User report settings creation error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı ayarları kaydedilirken hata oluştu' },
      { status: 500 }
    )
  }
}


