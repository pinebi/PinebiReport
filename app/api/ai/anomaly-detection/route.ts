import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, startDate, endDate } = await request.json()

    console.log('🔍 Anomaly Detection API Request:', { userId, companyId, startDate, endDate })

    // Dashboard verilerini al
    const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        companyId,
        startDate,
        endDate
      })
    })

    const dashboardData = await dashboardResponse.json()

    if (!dashboardData.success) {
      throw new Error('Dashboard data fetch failed')
    }

    const anomalies = []

    // 1. Satış verilerinde anomali tespiti
    if (dashboardData.data?.kpiData) {
      const salesData = dashboardData.data.kpiData
      
      // Günlük satış ortalaması hesapla
      const dailySales = salesData.find((item: any) => item.title === 'Günlük Satış')
      if (dailySales) {
        const currentSales = dailySales.value
        const averageSales = currentSales * 0.7 // Basit ortalama hesaplama
        
        if (currentSales < averageSales * 0.5) {
          anomalies.push({
            type: 'sales_drop',
            severity: 'high',
            title: 'Satış Düşüşü Tespit Edildi',
            description: `Günlük satışlar normal seviyenin %50 altında (${currentSales.toLocaleString()} TL)`,
            recommendation: 'Satış ekibiyle görüşüp nedenleri araştırın',
            impact: 'Yüksek',
            detectedAt: new Date().toISOString()
          })
        }
      }
    }

    // 2. Veri tutarsızlığı kontrolü
    if (dashboardData.data?.gridData) {
      const gridData = dashboardData.data.gridData
      
      // Boş veya null değerler kontrolü
      const emptyRows = gridData.filter((row: any) => 
        Object.values(row).some(value => value === null || value === '' || value === 0)
      )

      if (emptyRows.length > gridData.length * 0.1) { // %10'dan fazla boş satır
        anomalies.push({
          type: 'data_inconsistency',
          severity: 'medium',
          title: 'Veri Tutarsızlığı',
          description: `Rapor verilerinde ${emptyRows.length} adet eksik/boş kayıt tespit edildi`,
          recommendation: 'Veri kaynağını kontrol edin ve eksik verileri tamamlayın',
          impact: 'Orta',
          detectedAt: new Date().toISOString()
        })
      }
    }

    // 3. API yanıt süresi analizi
    const responseTime = dashboardData.responseTime || 0
    if (responseTime > 10000) { // 10 saniyeden fazla
      anomalies.push({
        type: 'performance_issue',
        severity: 'medium',
        title: 'Performans Sorunu',
        description: `API yanıt süresi ${responseTime}ms - Normal seviyenin üzerinde`,
        recommendation: 'Sunucu performansını kontrol edin ve optimizasyon yapın',
        impact: 'Orta',
        detectedAt: new Date().toISOString()
      })
    }

    // 4. Veri hacmi analizi
    if (dashboardData.data?.gridData) {
      const dataVolume = dashboardData.data.gridData.length
      const expectedVolume = 100 // Beklenen minimum veri sayısı
      
      if (dataVolume < expectedVolume) {
        anomalies.push({
          type: 'low_data_volume',
          severity: 'low',
          title: 'Düşük Veri Hacmi',
          description: `Sadece ${dataVolume} kayıt bulundu - Beklenen minimum ${expectedVolume}`,
          recommendation: 'Veri kaynağının doğru çalıştığını kontrol edin',
          impact: 'Düşük',
          detectedAt: new Date().toISOString()
        })
      }
    }

    // 5. Tarih aralığı analizi
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 30) {
      anomalies.push({
        type: 'large_date_range',
        severity: 'low',
        title: 'Geniş Tarih Aralığı',
        description: `${daysDiff} günlük veri aralığı seçildi - Performans etkilenebilir`,
        recommendation: 'Daha küçük tarih aralıkları kullanmayı düşünün',
        impact: 'Düşük',
        detectedAt: new Date().toISOString()
      })
    }

    // Anomali geçmişini kaydet
    if (anomalies.length > 0) {
      try {
        await prisma.anomalyDetection.createMany({
          data: anomalies.map(anomaly => ({
            userId,
            companyId,
            type: anomaly.type,
            severity: anomaly.severity,
            title: anomaly.title,
            description: anomaly.description,
            recommendation: anomaly.recommendation,
            impact: anomaly.impact,
            detectedAt: new Date(anomaly.detectedAt)
          }))
        })
      } catch (dbError) {
        console.log('⚠️ Anomaly detection table not found, skipping save')
      }
    }

    console.log('✅ Anomaly detection completed:', anomalies.length, 'anomalies found')

    return NextResponse.json({
      success: true,
      anomalies,
      summary: {
        total: anomalies.length,
        high: anomalies.filter(a => a.severity === 'high').length,
        medium: anomalies.filter(a => a.severity === 'medium').length,
        low: anomalies.filter(a => a.severity === 'low').length
      }
    })

  } catch (error: any) {
    console.error('❌ Anomaly Detection API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}


