import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Varsayılan config
    const defaultConfig = {
      reportId: 'report_1760210383116_6lkplj9um', // Satış Analiz Raporu
      reportName: 'Satış Analiz Raporu'
    }

    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('Error fetching dashboard config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      )
    }

    // Rapor var mı kontrol et
    const report = await db.reportConfig.findById(reportId)
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    console.log('✅ Dashboard config updated:', {
      reportId,
      reportName: report.name
    })

    // TODO: Veritabanına kaydet (şimdilik memory'de)
    // Şimdilik localStorage'da tutulacak (frontend'de)

    return NextResponse.json({
      success: true,
      reportId,
      reportName: report.name
    })
  } catch (error) {
    console.error('Error saving dashboard config:', error)
    return NextResponse.json(
      { error: 'Failed to save dashboard config' },
      { status: 500 }
    )
  }
}

