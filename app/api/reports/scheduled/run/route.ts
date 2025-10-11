import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { scheduledReportId } = await request.json()
    
    console.log('🚀 Running scheduled report:', scheduledReportId)
    
    // Burada raporu çalıştırıp email/whatsapp ile gönderebilirsiniz
    // 1. Raporu çalıştır
    // 2. Excel/PDF oluştur
    // 3. Email/WhatsApp ile gönder
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return NextResponse.json({ 
      success: true,
      message: 'Rapor başarıyla çalıştırıldı ve gönderildi',
      reportUrl: '/reports/generated/weekly-sales-2025-10-08.xlsx'
    })
  } catch (error: any) {
    console.error('❌ Scheduled report run error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}



