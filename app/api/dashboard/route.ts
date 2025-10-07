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
    
    // Firma bazlı rapor seçimi (case-insensitive)
    if (firma === 'RMK') {
      selectedReport = reports.find(r => r.name === 'Satis Raporu RMK')
    } else if (firma === 'BELPAS') {
      selectedReport = reports.find(r => r.name.toLowerCase().includes('satış raporu belpas') || r.name === 'Satis Raporu BELPAS')
    } else {
      // Varsayılan olarak ilk satış raporunu seç
      selectedReport = reports.find(r => r.name.includes('Satis Raporu'))
    }
    
    // Aylık rapor seçimi (yıllık karşılaştırma için - tüm firmalar)
    const monthlyReport = reports.find(r => r.name === 'Aylık Satış Raporu')
    
    console.log('🔍 Searching for monthly report: Aylık Satış Raporu')
    console.log('📅 Monthly report found:', monthlyReport ? monthlyReport.name : 'NOT FOUND - using fallback')
    console.log('📋 First 5 reports:', reports.slice(0, 5).map(r => r.name).join(', '))
    
    if (!selectedReport) {
      console.log('❌ No suitable report found for company:', firma)
      throw new Error(`No report found for company: ${firma}`)
    }
    
    console.log('✅ Selected report:', selectedReport.name, 'for company:', firma)
    console.log('🔗 Report endpoint:', selectedReport.endpointUrl)
    console.log('📋 Report headers:', selectedReport.headers)
    
    // Seçilen raporun DOĞRU formatını kullan - USER ID SABİT
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
          "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9" // SABİT USER ID - tüm raporlarda aynı
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
      const processedData = await processDashboardData(data, monthlyReport, request)

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

async function processDashboardData(rawData: any, monthlyReport: any, request: NextRequest) {
  try {
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
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.log('⚠️ No valid data array, using mock data')
      const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
      const defaultEndDate = new Date().toISOString().split('T')[0]
      return getMockDashboardData(defaultStartDate, defaultEndDate, 'RMK')
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
      .slice(0, 30) // Top 30 müşteri
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
    
    // Aylık karşılaştırma verileri (2025 vs 2024 - Aylık rapor ile)
    const monthlyComparison = monthlyReport 
      ? await generateYearlyComparisonFromMonthlyAPI(monthlyReport, request)
      : generateMonthlyComparisonFromData(dataArray)
    
    // Günlük Grid - Firma bazında toplamlar (Tarih olmadan)
    const dailyGrid = generateCompanyGridSummary(dataArray)
    
    // Müşteri başına ortalama ciro hesaplama
    const customerRevenueData = Object.entries(companyData)
      .map(([company, data]: any) => ({
        company,
        totalRevenue: data.revenue,
        totalCustomers: data.customers,
        averageRevenue: data.customers > 0 ? data.revenue / data.customers : 0,
        trend: 'stable' as 'up' | 'down' | 'stable' // Şimdilik sabit, ileride önceki dönem ile karşılaştırılabilir
      }))
      .sort((a, b) => b.averageRevenue - a.averageRevenue)
    
    // console.log('🔍 Customer Revenue Data:', customerRevenueData)
    
    return {
      kpiData,
      paymentDistribution,
      dailySales,
      topCustomers,
      companyPerformance,
      dailyGrid,
      monthlyComparison,
      customerRevenueData
    }
    
  } catch (error) {
    console.error('Error processing dashboard data:', error)
    // Hata durumunda varsayılan tarihlerle mock data döndür
    const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const defaultEndDate = new Date().toISOString().split('T')[0]
    return getMockDashboardData(defaultStartDate, defaultEndDate, 'RMK')
  }
}

// Aylık API ile yıllık karşılaştırma (2025 vs 2024 - 24 istek)
async function generateYearlyComparisonFromMonthlyAPI(monthlyReport: any, request: NextRequest) {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  
  console.log(`📊 Fetching yearly comparison: ${currentYear} vs ${currentYear - 1}`)
  
  try {
    // 2025 yılı için API çağrısı (YIL: "2025" string olarak)
    const currentYearData = await fetchYearTotalByYear(monthlyReport, currentYear.toString(), request)
    
    // 2024 yılı için API çağrısı (YIL: "2024" string olarak)
    const previousYearData = await fetchYearTotalByYear(monthlyReport, (currentYear - 1).toString(), request)
    
    console.log(`✅ ${currentYear} toplam:`, currentYearData)
    console.log(`✅ ${currentYear - 1} toplam:`, previousYearData)
    
    // Şimdilik sadece yıllık toplamı gösterelim - aylık breakdown API'de yoksa
    // Toplamı 12 aya eşit dağıtalım (geçici çözüm)
    const monthlyData = months.map((month, index) => {
      const currentMonthTotal = currentYearData / 12
      const previousMonthTotal = previousYearData / 12
      
      const growth = previousMonthTotal > 0 
        ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
        : 0
      
      return {
        month,
        currentYear: Math.round(currentMonthTotal),
        previousYear: Math.round(previousMonthTotal),
        growth: Math.round(growth * 10) / 10,
        formattedMonth: month.substring(0, 3),
        year: currentYear
      }
    })
    
    console.log('📊 Yearly Comparison Data:', monthlyData)
    return monthlyData
    
  } catch (error: any) {
    console.error('❌ Error fetching yearly comparison:', error.message)
    return []
  }
}

// ESKI YIL API VERSIYONU (kullanılmıyor)
async function generateMonthlyComparisonFromYearlyAPI_OLD(yearlyReport: any, request: NextRequest) {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const previousYear = currentYear - 1
  
  console.log(`📊 Fetching yearly comparison data: ${currentYear} vs ${previousYear}`)
  
  try {
    // Bu yıl için API çağrısı
    const currentYearData = await fetchYearTotal_OLD(yearlyReport, currentYear, request)
    
    // Geçen yıl için API çağrısı
    const previousYearData = await fetchYearTotal_OLD(yearlyReport, previousYear, request)
    
    console.log(`✅ ${currentYear} data:`, currentYearData ? 'Received' : 'No data')
    console.log(`✅ ${previousYear} data:`, previousYearData ? 'Received' : 'No data')
    
    // Aylık toplamları hesapla
    const monthlyData = months.map((month, index) => {
      const currentMonthTotal = currentYearData[index] || 0
      const previousMonthTotal = previousYearData[index] || 0
      
      const growth = previousMonthTotal > 0 
        ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
        : 0
      
      return {
        month,
        currentYear: Math.round(currentMonthTotal),
        previousYear: Math.round(previousMonthTotal),
        growth: Math.round(growth * 10) / 10,
        formattedMonth: month.substring(0, 3),
        year: currentYear
      }
    })
    
    console.log('📊 Monthly Comparison Data (from Yearly API):', monthlyData)
    
    return monthlyData
    
  } catch (error: any) {
    console.error('❌ Error fetching yearly comparison:', error.message)
    // Hata durumunda boş array döndür
    return []
  }
}

// Belirli yıl ve ay için API'den toplam ciro çek (AY + YIL parametresi)
async function fetchMonthTotalByMonth(monthlyReport: any, year: number, month: number, request: NextRequest) {
  const requestBody = {
    apiUrl: monthlyReport.endpointUrl,
    headers: {
      ...JSON.parse(monthlyReport.headers || '{}'),
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${monthlyReport.apiUsername}:${monthlyReport.apiPassword}`).toString('base64')}`
    },
    method: 'POST',
    body: {
      "USER": {
        "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
      },
      "AY": month,    // 1-12
      "YIL": year     // 2024, 2025
    }
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
  
  try {
    console.log(`📅 Fetching ${year}/${month} data...`)
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
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const responseText = await response.text()
    const data = JSON.parse(responseText)
    
    // Veriyi işle ve toplam ciroyu hesapla
    let dataArray = null
    if (data && data.data && data.data.DATAS) {
      dataArray = data.data.DATAS
    } else if (data && data.DATAS) {
      dataArray = data.DATAS
    }
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.log(`⚠️ No data for ${year}/${month}`)
      return 0
    }
    
    // Toplam ciroyu hesapla
    const total = dataArray.reduce((sum: number, item: any) => {
      return sum + (item['GENEL_TOPLAM'] || item['Tutar'] || 0)
    }, 0)
    
    console.log(`📊 ${year}/${month} total: ${total}`)
    
    return total
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`Error fetching ${year}/${month} total:`, error.message)
    return 0
  }
}

// YENİ - YIL parametresi STRING olarak - sadece yıllık toplam çeker
async function fetchYearTotalByYear(monthlyReport: any, year: string, request: NextRequest) {
  const requestBody = {
    apiUrl: monthlyReport.endpointUrl,
    headers: {
      ...JSON.parse(monthlyReport.headers || '{}'),
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${monthlyReport.apiUsername}:${monthlyReport.apiPassword}`).toString('base64')}`
    },
    method: 'POST',
    body: {
      "USER": {
        "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
      },
      "YIL": year  // YIL string olarak ("2025", "2024")
    }
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  
  try {
    console.log(`📅 Fetching year ${year} data (YIL as string)...`)
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
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const responseText = await response.text()
    const data = JSON.parse(responseText)
    
    let dataArray = null
    if (data && data.data && data.data.DATAS) {
      dataArray = data.data.DATAS
    } else if (data && data.DATAS) {
      dataArray = data.DATAS
    }
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.log(`⚠️ No data for year ${year}`)
      return 0
    }
    
    // Yıllık toplam
    const total = dataArray.reduce((sum: number, item: any) => {
      return sum + (item['GENEL_TOPLAM'] || item['Tutar'] || 0)
    }, 0)
    
    console.log(`📊 Year ${year} total: ${total}`)
    
    return total
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`Error fetching year ${year} total:`, error.message)
    return 0
  }
}

// ESKI - Belirli bir yıl için API'den aylık toplamları çek
async function fetchYearTotal_OLD(yearlyReport: any, year: number, request: NextRequest) {
  const requestBody = {
    apiUrl: yearlyReport.endpointUrl,
    headers: {
      ...JSON.parse(yearlyReport.headers || '{}'),
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${yearlyReport.apiUsername}:${yearlyReport.apiPassword}`).toString('base64')}`
    },
    method: 'POST',
    body: {
      "USER": {
        "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
      },
      "YIL": year  // Yıl parametresi
    }
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  try {
    console.log(`📅 Fetching year ${year} data...`)
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
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const responseText = await response.text()
    const data = JSON.parse(responseText)
    
    // Veriyi işle - Aya göre grupla
    let dataArray = null
    if (data && data.data && data.data.DATAS) {
      dataArray = data.data.DATAS
    } else if (data && data.DATAS) {
      dataArray = data.DATAS
    }
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.log(`⚠️ No data for year ${year}`)
      return Array(12).fill(0)
    }
    
    // Aylara göre topla (Ocak=0, Aralık=11)
    const monthlyTotals = Array(12).fill(0)
    
    dataArray.forEach(item => {
      // API'nin döndüğü ay bilgisine göre (AyNo, Ay, vb.)
      const monthIndex = getMonthIndex(item)
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyTotals[monthIndex] += item['GENEL_TOPLAM'] || item['Tutar'] || 0
      }
    })
    
    console.log(`📊 Year ${year} monthly totals:`, monthlyTotals)
    
    return monthlyTotals
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`Error fetching year ${year} total:`, error.message)
    return Array(12).fill(0)
  }
}

// API yanıtından ay indeksini al
function getMonthIndex(item: any): number {
  // Farklı formatları dene
  if (item['AyNo']) return parseInt(item['AyNo']) - 1
  if (item['Ay']) {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    return monthNames.indexOf(item['Ay'])
  }
  if (item['MONTH']) return parseInt(item['MONTH']) - 1
  if (item['Tarih']) {
    const date = new Date(item['Tarih'])
    return date.getMonth()
  }
  return -1
}

// Firma bazında grid özet verisi oluştur (Tarih olmadan)
function generateCompanyGridSummary(dataArray: any[]) {
  const firmaSummary: { [key: string]: any } = {}
  
  // Verileri firmaya göre grupla ve topla
  dataArray.forEach(item => {
    const firma = item['Firma'] || 'Bilinmeyen'
    
    if (!firmaSummary[firma]) {
      firmaSummary[firma] = {
        Firma: firma,
        'Musteri Sayisi': 0,
        NAKIT: 0,
        KREDI_KARTI: 0,
        ACIK_HESAP: 0,
        'NAKIT+KREDI_KARTI': 0,
        GENEL_TOPLAM: 0
      }
    }
    
    firmaSummary[firma]['Musteri Sayisi'] += item['Musteri Sayisi'] || 0
    firmaSummary[firma].NAKIT += item['NAKIT'] || 0
    firmaSummary[firma].KREDI_KARTI += item['KREDI_KARTI'] || 0
    firmaSummary[firma].ACIK_HESAP += item['ACIK_HESAP'] || 0
    firmaSummary[firma]['NAKIT+KREDI_KARTI'] += item['NAKIT+KREDI_KARTI'] || 0
    firmaSummary[firma].GENEL_TOPLAM += item['GENEL_TOPLAM'] || 0
  })
  
  // Object'i array'e çevir ve toplam ciroya göre sırala
  const summaryArray = Object.values(firmaSummary)
    .sort((a: any, b: any) => b.GENEL_TOPLAM - a.GENEL_TOPLAM)
  
  // console.log('📊 Company Grid Summary:', summaryArray)
  
  return summaryArray
}

// Gerçek verilerden aylık karşılaştırma oluştur
function generateMonthlyComparisonFromData(dataArray: any[]) {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  
  // Verileri aya göre grupla
  const monthlyTotals: { [key: string]: number } = {}
  
  dataArray.forEach(item => {
    if (item.Tarih) {
      const date = new Date(item.Tarih)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}` // "2025-9" formatında
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0
      }
      monthlyTotals[monthKey] += item.GENEL_TOPLAM || 0
    }
  })
  
  console.log('📊 Monthly Totals:', monthlyTotals)
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  
  // Son 12 ayı oluştur
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(currentDate)
    targetDate.setMonth(currentDate.getMonth() - i)
    
    const monthIndex = targetDate.getMonth()
    const year = targetDate.getFullYear()
    const monthKey = `${year}-${monthIndex}`
    const previousYearKey = `${year - 1}-${monthIndex}`
    
    const currentYearValue = monthlyTotals[monthKey] || 0
    const previousYearValue = monthlyTotals[previousYearKey] || 0
    
    // Sadece veri varsa ekle
    if (currentYearValue > 0 || previousYearValue > 0) {
      const growth = previousYearValue > 0 
        ? ((currentYearValue - previousYearValue) / previousYearValue) * 100 
        : 0
      
      monthlyData.push({
        month: months[monthIndex],
        currentYear: Math.round(currentYearValue),
        previousYear: Math.round(previousYearValue),
        growth: Math.round(growth * 10) / 10, // 1 ondalık basamak
        formattedMonth: months[monthIndex].substring(0, 3),
        year: year
      })
    }
  }
  
  console.log('📊 Monthly Comparison Data:', monthlyData)
  
  return monthlyData
}

// Eski mock fonksiyonu (fallback olarak kullanılabilir)
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
    dailyGrid: generateCompanyGridSummary(generateMockGridData(dailySales)),
    monthlyComparison: generateMonthlyComparisonFromData(generateMockGridData(dailySales)),
    customerRevenueData: [
      {
        company: "Rahmi M.Koç Müzesi",
        totalRevenue: Math.round(totalRevenue * 0.75),
        totalCustomers: Math.round(totalCustomers * 0.7),
        averageRevenue: Math.round((totalRevenue * 0.75) / (totalCustomers * 0.7)),
        trend: 'up' as 'up' | 'down' | 'stable',
        change: 12.5
      },
      {
        company: "Rahmi M.Koç Kitaplık",
        totalRevenue: Math.round(totalRevenue * 0.15),
        totalCustomers: Math.round(totalCustomers * 0.2),
        averageRevenue: Math.round((totalRevenue * 0.15) / (totalCustomers * 0.2)),
        trend: 'down' as 'up' | 'down' | 'stable',
        change: -3.2
      },
      {
        company: "Rahmi M.Koç Ayvalık",
        totalRevenue: Math.round(totalRevenue * 0.08),
        totalCustomers: Math.round(totalCustomers * 0.08),
        averageRevenue: Math.round((totalRevenue * 0.08) / (totalCustomers * 0.08)),
        trend: 'up' as 'up' | 'down' | 'stable',
        change: 5.8
      },
      {
        company: "Rahmi M.Koç Cunda",
        totalRevenue: Math.round(totalRevenue * 0.02),
        totalCustomers: Math.round(totalCustomers * 0.02),
        averageRevenue: Math.round((totalRevenue * 0.02) / (totalCustomers * 0.02)),
        trend: 'stable' as 'up' | 'down' | 'stable',
        change: 0.5
      }
    ]
  }
}

function generateMockGridData(dailySales: any[]) {
  const gridData: any[] = []
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
