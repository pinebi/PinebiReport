import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  // Değişkenleri dışarıda tanımla (scope için)
  let startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  let endDate = new Date().toISOString().split('T')[0]
  let firma = 'RMK'
  
  try {
    console.log('=== DASHBOARD API CALL START (Dynamic Company Report Selection) ===')
    console.log('Request received at:', new Date().toISOString())
    
    // Request body'den parametreleri al
    const body = await request.json()
    startDate = body.startDate || startDate
    endDate = body.endDate || endDate
    firma = body.firma || firma
    
    console.log('📅 Date parameters:', { startDate, endDate, firma })
    
    // Firma bazlı rapor seçimi
    let selectedReport = null
    
    // Mevcut raporları al
    const reports = await db.reportConfig.findAll()
    console.log('📊 Available reports:', reports.length)
    
    // Firma bazlı rapor seçimi
    if (firma === 'RMK') {
      selectedReport = reports.find(r => r.name === 'Satis Raporu RMK')
    } else if (firma === 'BELPAS') {
      selectedReport = reports.find(r => r.name === 'Satis Raporu BELPAS')
    } else {
      // Varsayılan olarak ilk satış raporunu seç
      selectedReport = reports.find(r => r.name.includes('Satis Raporu'))
    }
    
    if (!selectedReport) {
      console.log('❌ No suitable report found for company:', firma)
      throw new Error(`No report found for company: ${firma}`)
    }
    
    console.log('✅ Selected report:', selectedReport.name, 'for company:', firma)
    console.log('🔗 Report endpoint:', selectedReport.endpointUrl)
    console.log('📋 Report headers:', selectedReport.headers)
    
    // Seçilen raporun DOĞRU formatını kullan (cmfpr3nwz00015bin26gk8r6f formatı)
    const requestBody = {
      apiUrl: selectedReport.endpointUrl,
      headers: {
        ...JSON.parse(selectedReport.headers || '{}'),
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${selectedReport.apiUsername}:${selectedReport.apiPassword}`).toString('base64')}`
      },
      method: 'POST',
      body: {
        "USER": {
          "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
        },
        "START_DATE": startDate,
        "END_DATE": endDate
      }
    }
    
    console.log('📤 Request body (cmfpr3nwz00015bin26gk8r6f format):', requestBody)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      console.log('🚀 Making API call to /api/reports/run...')
      const baseUrl = new URL(request.url).origin
      const response = await fetch(`${baseUrl}/api/reports/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      console.log('📥 API response status:', response.status)
      console.log('📥 API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API request failed:', response.status, response.statusText)
        console.error('❌ Error response:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      // Try to parse JSON response
      let data
      const contentType = response.headers.get('content-type')
      const responseText = await response.text()
      
      console.log('📄 Response content-type:', contentType)
      console.log('📄 Response text length:', responseText.length)
      console.log('📄 Response preview:', responseText.substring(0, 500))
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText)
          console.log('✅ JSON parsed successfully')
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError)
          console.error('❌ Response text:', responseText)
          throw new Error(`Invalid JSON response: ${parseError}`)
        }
      } else {
        console.error('❌ Response is not JSON format')
        console.error('❌ Content-Type:', contentType)
        throw new Error('Response is not JSON format')
      }

      // Dashboard verilerini işle ve döndür
      console.log('🔄 Processing dashboard data...')
      const processedData = processDashboardData(data)

      console.log('✅ Dashboard data processed successfully')
      return NextResponse.json({ 
        success: true, 
        data: processedData,
        status: response.status,
        statusText: response.statusText,
        isMock: false
      })
      
    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError.message)
      console.error('❌ Error type:', fetchError.name)
      console.error('❌ Stack trace:', fetchError.stack)
      
      if (fetchError.name === 'AbortError') {
        console.log('⏰ Request timeout - using mock data')
      } else if (fetchError.message.includes('fetch')) {
        console.log('🌐 Network error - using mock data')
      } else {
        console.log('🔧 Other error - using mock data')
      }
      
      // Hata durumunda mock data döndür
      const mockData = getMockDashboardData(startDate, endDate, firma)
      
      return NextResponse.json({ 
        success: true, 
        data: mockData,
        isMock: true,
        error: fetchError.message,
        errorType: fetchError.name
      })
    }

  } catch (error: any) {
    console.error('Dashboard API error:', error)
    
    // Hata durumunda mock data döndür
    const mockData = getMockDashboardData(startDate, endDate, firma)
    
    return NextResponse.json({ 
      success: true, 
      data: mockData,
      isMock: true,
      error: error.message
    })
  }
}

// GET method'u da destekle (geriye uyumluluk için)
export async function GET(request: NextRequest) {
  try {
    console.log('=== DASHBOARD API CALL START (GET) ===')
    console.log('Request received at:', new Date().toISOString())
    
    // URL'den tarih parametrelerini al
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const firma = searchParams.get('firma') || 'RMK'
    
    console.log('📅 Date parameters:', { startDate, endDate, firma })
    
    // POST method'unu çağır
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, firma })
    })
    
    return await POST(postRequest as NextRequest)
    
  } catch (error: any) {
    console.error('Dashboard API GET error:', error)
    
    // Hata durumunda mock data döndür
    const mockData = getMockDashboardData(
      new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
      'RMK'
    )
    
    return NextResponse.json({ 
      success: true, 
      data: mockData,
      isMock: true,
      error: error.message
    })
  }
}

function processDashboardData(rawData: any) {
  try {
    console.log('Processing dashboard data...')
    console.log('Raw data type:', typeof rawData)
    console.log('Raw data keys:', rawData ? Object.keys(rawData) : 'No keys')
    
    // Pinebi API'den gelen veri formatını işle
    let dataArray = null
    
    // Eğer rawData.data varsa (API response wrapper)
    if (rawData && rawData.data && rawData.data.DATAS) {
      dataArray = rawData.data.DATAS
    }
    // Eğer doğrudan DATAS varsa
    else if (rawData && rawData.DATAS) {
      dataArray = rawData.DATAS
    }
    // Eğer array ise
    else if (Array.isArray(rawData)) {
      dataArray = rawData
    }
    
    console.log('Processed data array:', dataArray)
    console.log('Data array length:', dataArray ? dataArray.length : 0)
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.log('No valid data array found, using mock data')
      return getMockDashboardData()
    }
    
    // Toplam hesaplamalar (Pinebi API formatına uygun)
    const totals = dataArray.reduce((acc: any, item: any) => {
      acc.genelToplam += item['GENEL_TOPLAM'] || 0
      acc.musteriSayisi += item['Musteri Sayisi'] || 0
      acc.nakit += item['NAKIT'] || 0
      acc.krediKarti += item['KREDI_KARTI'] || 0
      acc.acikHesap += item['ACIK_HESAP'] || 0
      return acc
    }, { genelToplam: 0, musteriSayisi: 0, nakit: 0, krediKarti: 0, acikHesap: 0 })
    
    // KPI verileri (Frontend formatına uygun - Object format)
    const kpiData = {
      toplamCiro: totals.genelToplam,
      nakit: totals.nakit,
      krediKarti: totals.krediKarti,
      nakitKrediKarti: totals.nakit + totals.krediKarti,
      acikHesap: totals.acikHesap
    }
    
    console.log('🔍 Calculated totals:', totals)
    console.log('🔍 KPI Data created:', kpiData)
    
    // Ödeme dağılımı (Frontend formatına uygun)
    const paymentDistribution = [
      {
        name: 'Nakit',
        value: totals.nakit,
        color: '#10b981'
      },
      {
        name: 'Kredi Kartı',
        value: totals.krediKarti,
        color: '#6b7280'
      },
      {
        name: 'Açık Hesap',
        value: totals.acikHesap,
        color: '#ef4444'
      }
    ].filter(item => item.value > 0)
    
    // Günlük satışlar (Frontend formatına uygun)
    const dailySales = dataArray.map(item => ({
      date: item['Tarih'],
      amount: item['GENEL_TOPLAM'] || 0,
      formattedDate: new Date(item['Tarih']).toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      dayOfWeek: new Date(item['Tarih']).toLocaleDateString('tr-TR', { weekday: 'short' })
    }))
    
    // En iyi müşteriler (Frontend formatına uygun - Firma bazlı)
    const customerTotals = dataArray.reduce((acc: any, item: any) => {
      const firma = item['Firma'] || 'Bilinmeyen'
      acc[firma] = (acc[firma] || 0) + (item['GENEL_TOPLAM'] || 0)
      return acc
    }, {})

    const topCustomers = Object.entries(customerTotals)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .map(([name, amount]: any, index) => ({
        name,
        amount,
        rank: index + 1
      }))
    
    // Şirket performansı
    const companyData = dataArray.reduce((acc: any, item: any) => {
      const firma = item['Firma'] || 'Bilinmeyen'
      if (!acc[firma]) {
        acc[firma] = { revenue: 0, customers: 0 }
      }
      acc[firma].revenue += item['GENEL_TOPLAM'] || 0
      acc[firma].customers += item['Musteri Sayisi'] || 0
      return acc
    }, {})

    console.log('🔍 Company Data:', companyData)
    
    const companyPerformance = Object.entries(companyData)
      .map(([company, data]: any) => {
        console.log(`🔍 Processing company: ${company}, customers: ${data.customers}`)
        return {
          company,
          revenue: data.revenue,
          customers: data.customers,
          marketShare: totals.genelToplam > 0 ? (data.revenue / totals.genelToplam) * 100 : 0
        }
      })
      .sort((a, b) => b.marketShare - a.marketShare)
    
    console.log('🔍 Final Company Performance:', companyPerformance)
    
    // Aylık karşılaştırma verileri (Mock data - gerçek veriler için ayrı API çağrısı gerekebilir)
    const monthlyComparison = generateMonthlyComparisonData()
    
    return {
      kpiData,
      paymentDistribution,
      dailySales,
      topCustomers,
      companyPerformance,
      dailyGrid: dataArray,
      monthlyComparison
    }
    
  } catch (error) {
    console.error('Error processing dashboard data:', error)
    // Hata durumunda varsayılan tarihlerle mock data döndür
    const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const defaultEndDate = new Date().toISOString().split('T')[0]
    return getMockDashboardData(defaultStartDate, defaultEndDate, 'RMK')
  }
}

function generateMonthlyComparisonData() {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() // 2025
  const currentMonth = currentDate.getMonth() // 0-11 (Ocak=0, Aralık=11)
  
  const monthlyData = months.map((month, index) => {
    // Sadece güncel tarihe kadar olan ayları göster
    if (index > currentMonth) {
      return null // Gelecek aylar için null döndür
    }
    
    // 2025 verileri (bu yıl)
    const year2025 = Math.round(180000 + Math.random() * 120000)
    // 2024 verileri (geçen yıl)
    const year2024 = Math.round(year2025 * (0.75 + Math.random() * 0.5))
    const growth = ((year2025 - year2024) / year2024) * 100
    
    return {
      month,
      currentYear: year2025,
      previousYear: year2024,
      growth,
      formattedMonth: month.substring(0, 3) // İlk 3 harf
    }
  }).filter(item => item !== null) // null olanları filtrele
  
  return monthlyData
}

function getMockDashboardData(startDate: string, endDate: string, firma: string) {
  // Kullanıcının seçtiği tarih aralığı bazlı dinamik mock data
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  console.log(`📅 Generating mock data for ${firma}: ${startDate} to ${endDate} (${daysDiff} days)`)
  
  // Seçilen tarih aralığındaki günlük satış verileri
  const dailySales = []
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dayOfWeek = date.getDay()
    
    // Hafta sonları daha düşük satış
    const baseAmount = dayOfWeek === 0 || dayOfWeek === 6 ? 6000 : 8500
    const variation = Math.random() * 4000 - 2000 // ±2000 varyasyon
    const amount = Math.round(baseAmount + variation)
    
    dailySales.push({
      date: date.toISOString().split('T')[0],
      amount: amount,
      count: Math.round(amount / 200) // Fatura sayısı tahmini
    })
  }
  
  // Toplam hesaplamalar
  const totalRevenue = dailySales.reduce((sum, day) => sum + day.amount, 0)
  const totalInvoices = dailySales.reduce((sum, day) => sum + day.count, 0)
  const avgInvoice = Math.round(totalRevenue / totalInvoices)
  
  // Müşteri sayısı (günlük ortalama bazlı)
  const avgDailyCustomers = Math.round(totalInvoices / 30)
  const totalCustomers = avgDailyCustomers * 1.5 // Tekrar eden müşteriler
  
  return {
    kpiData: [
      {
        title: 'Toplam Ciro',
        value: totalRevenue,
        change: `+${(Math.random() * 20 + 5).toFixed(1)}%`,
        trend: 'up'
      },
      {
        title: 'Müşteri Sayısı',
        value: totalCustomers,
        change: `+${(Math.random() * 15 + 3).toFixed(1)}%`,
        trend: 'up'
      },
      {
        title: 'Fatura Sayısı',
        value: totalInvoices,
        change: `+${(Math.random() * 25 + 8).toFixed(1)}%`,
        trend: 'up'
      },
      {
        title: 'Ortalama Fatura',
        value: avgInvoice,
        change: `+${(Math.random() * 10 + 2).toFixed(1)}%`,
        trend: 'up'
      }
    ],
    paymentDistribution: [
      { name: 'Nakit', value: Math.round(totalRevenue * 0.45), percentage: '45.0' },
      { name: 'Kredi Kartı', value: Math.round(totalRevenue * 0.35), percentage: '35.0' },
      { name: 'Banka Transferi', value: Math.round(totalRevenue * 0.15), percentage: '15.0' },
      { name: 'Çek', value: Math.round(totalRevenue * 0.05), percentage: '5.0' }
    ],
    dailySales: dailySales,
    topCustomers: [
      { name: 'Rahmi M.Koç Müzesi', amount: Math.round(totalRevenue * 0.75), rank: 1 },
      { name: 'Rahmi M.Koç Kitaplık', amount: Math.round(totalRevenue * 0.15), rank: 2 },
      { name: 'Rahmi M.Koç Ayvalık', amount: Math.round(totalRevenue * 0.08), rank: 3 },
      { name: 'Rahmi M.Koç Cunda', amount: Math.round(totalRevenue * 0.02), rank: 4 }
    ],
    companyPerformance: [
      {
        company: "Rahmi M.Koç Müzesi",
        revenue: Math.round(totalRevenue * 0.75),
        customers: Math.round(totalCustomers * 0.7),
        marketShare: 75.0
      },
      {
        company: "Rahmi M.Koç Kitaplık",
        revenue: Math.round(totalRevenue * 0.15),
        customers: Math.round(totalCustomers * 0.2),
        marketShare: 15.0
      },
      {
        company: "Rahmi M.Koç Ayvalık",
        revenue: Math.round(totalRevenue * 0.08),
        customers: Math.round(totalCustomers * 0.08),
        marketShare: 8.0
      },
      {
        company: "Rahmi M.Koç Cunda",
        revenue: Math.round(totalRevenue * 0.02),
        customers: Math.round(totalCustomers * 0.02),
        marketShare: 2.0
      }
    ],
    dailyGrid: generateMockGridData(dailySales),
    monthlyComparison: generateMonthlyComparisonData()
  }
}

function generateMockGridData(dailySales: any[]) {
  const gridData = []
  dailySales.forEach((day, index) => {
    const customers = ['Rahmi M.Koç Müzesi', 'Rahmi M.Koç Kitaplık', 'Rahmi M.Koç Ayvalık', 'Rahmi M.Koç Cunda']
    const paymentTypes = ['Nakit', 'Kredi Kartı', 'Banka Transferi', 'Çek']
    
    // Her gün için 3-7 kayıt oluştur
    const recordCount = Math.floor(Math.random() * 5) + 3
    
    for (let i = 0; i < recordCount; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)]
      const amount = Math.round((day.amount / recordCount) * (0.5 + Math.random()))
      
      gridData.push({
        Tarih: day.date,
        Firma: customer,
        Musteri: customer,
        Odeme_Tipi: paymentType,
        GENEL_TOPLAM: amount,
        Musteri_Sayisi: 1,
        Fatura_Sayisi: 1
      })
    }
  })
  
  return gridData
}
