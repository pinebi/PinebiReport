import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  // Değişkenleri dışarıda tanımla (scope için)
  let startDate = new Date().toISOString().split('T')[0] // Bugün
  let endDate = new Date().toISOString().split('T')[0] // Bugün
  
  try {
    // Request body'den parametreleri al
    const body = await request.json()
    startDate = body.startDate || startDate
    endDate = body.endDate || endDate
    
    console.log('📅 Dashboard API Request:', { startDate, endDate })
    
    // Get user info from request headers
    const authHeader = request.headers.get('authorization')
    let userCompany = 'RMK' // Default
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const [userId] = Buffer.from(token, 'base64').toString().split(':')
        const user = await db.user.findById(userId)
        if (user && user.company) {
          userCompany = user.company.code || user.company.name
          console.log('👤 User company from token:', userCompany)
        }
      } catch (e) {
        console.log('⚠️ Could not parse user from token, using default:', userCompany)
      }
    }
    
    // Firma bazlı rapor seçimi
    let selectedReport = null
    
    // Mevcut raporları al
    console.log('📊 Fetching reports from database...');
    const reports = await db.reportConfig.findAll()
    console.log(`📊 Found ${reports.length} reports in database`);
    
    // Firmaya göre rapor seç
    if (userCompany === 'RMK') {
      selectedReport = reports.find(r => r.id === 'report_1760222244945_vafzbud7m')
      console.log('🏢 RMK firması - report_1760222244945_vafzbud7m kullanılıyor')
    } else if (userCompany === 'BELPAS') {
      selectedReport = reports.find(r => r.id === 'report_1760222160315_qdt2axzbj')
      console.log('🏢 BELPAS firması - report_1760222160315_qdt2axzbj kullanılıyor')
    }
    
    if (selectedReport) {
      console.log('✅ Dashboard Raporu BULUNDU');
      console.log(`📊 ID: ${selectedReport.id}`);
      console.log(`📊 Name: ${selectedReport.name}`);
      console.log(`📊 API: ${selectedReport.endpointUrl}`);
      
      const headers = JSON.parse(selectedReport.headers)
      console.log(`📊 Target URL: ${headers.url}`);
    } else {
      console.log('❌ Dashboard Raporu veritabanında YOK!');
      console.log('Aranan ID:', userCompany === 'RMK' ? 'report_1760222244945_vafzbud7m' : 'report_1760222160315_qdt2axzbj');
      console.log('Mevcut raporlar:', reports.map(r => `${r.name} (${r.id})`).join(', '));
      throw new Error('Dashboard raporu bulunamadı');
    }
    
    // Aylık rapor seçimi (yıllık karşılaştırma için - tüm firmalar)
    const monthlyReport = reports.find(r => r.name === 'Aylık Satış Raporu')
    console.log('📊 Monthly report:', monthlyReport ? monthlyReport.name : 'NOT FOUND');
    
    console.log(`✅ Using report: ${selectedReport.name}`);
    
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
          "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
        },
        "START_DATE": startDate,
        "END_DATE": endDate
      }
    }
    
    try {
      console.log('📡 Starting API call to /api/reports/run...')
      const startTime = Date.now()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ TIMEOUT! API call took more than 90 seconds')
        controller.abort()
      }, 90000) // 90 second timeout - Gerçek veri için yeterli süre
      
      const baseUrl = new URL(request.url).origin
      console.log('🔗 Calling:', `${baseUrl}/api/reports/run`)
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(`${baseUrl}/api/reports/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
      
      const elapsed = Date.now() - startTime
      console.log(`✅ API response received in ${elapsed}ms`)
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      // Parse JSON
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
        console.log('📥 External API response - success:', data.success)
        console.log('📥 External API response - DATAS count:', data.data?.DATAS?.length || 0)
        if (data.data?.DATAS?.length > 0) {
          console.log('📋 First data item keys:', Object.keys(data.data.DATAS[0]))
          console.log('📋 First data item sample:', JSON.stringify(data.data.DATAS[0]).substring(0, 200))
        }
      } catch (parseError) {
        throw new Error('Invalid JSON response')
      }

      // Dashboard verilerini işle ve döndür
      const processedData = await processDashboardData(data, monthlyReport, request)
      return NextResponse.json({ 
        success: true, 
        data: processedData,
        status: response.status,
        statusText: response.statusText,
        isMock: false
      })
      
    } catch (fetchError: any) {
      console.error('❌ Dashboard API error:', fetchError.message)
      
      return NextResponse.json({ 
        success: false, 
        error: 'API request failed: ' + fetchError.message,
        errorType: fetchError.name
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Dashboard error:', error.message)
    
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}

// GET method'u da destekle (geriye uyumluluk için)
export async function GET(request: NextRequest) {
  try {
    // URL'den tarih parametrelerini al
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0] // Bugün
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0] // Bugün
    const firma = searchParams.get('firma') || 'RMK'
    
    // POST method'unu çağır
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, firma })
    })
    
    return await POST(postRequest as NextRequest)
    
  } catch (error: any) {
    console.error('❌ Dashboard GET error:', error.message)
    
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}

async function processDashboardData(rawData: any, monthlyReport: any, request: NextRequest) {
  try {
    console.log('🔧 processDashboardData - rawData type:', typeof rawData);
    console.log('🔧 processDashboardData - rawData keys:', Object.keys(rawData || {}));
    
    // Pinebi API'den gelen veri formatını işle
    let dataArray = null
    
    // Eğer rawData.data varsa (API response wrapper)
    if (rawData && rawData.data && rawData.data.DATAS) {
      dataArray = rawData.data.DATAS
      console.log('✅ Data array found in rawData.data.DATAS');
    }
    // Eğer doğrudan DATAS varsa
    else if (rawData && rawData.DATAS) {
      dataArray = rawData.DATAS
      console.log('✅ Data array found in rawData.DATAS');
    }
    // Eğer array ise
    else if (Array.isArray(rawData)) {
      dataArray = rawData
      console.log('✅ rawData is already an array');
    }
    
    if (!dataArray || !Array.isArray(dataArray)) {
      console.error('❌ No valid data array found in API response');
      console.error('❌ rawData:', JSON.stringify(rawData).substring(0, 500));
      throw new Error('Invalid data format from API')
    }
    
    console.log(`✅ Processing ${dataArray.length} data items`);
    
    // Toplam hesaplamalar (Pinebi API formatına uygun)
    const totals = dataArray.reduce((acc: any, item: any) => {
      acc.genelToplam += item['Tutar'] || item['GENEL_TOPLAM'] || 0
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
      date: item['TarihGun'] || item['Tarih'],
      amount: item['Tutar'] || item['GENEL_TOPLAM'] || 0,
      formattedDate: (item['TarihGun'] || item['Tarih']) ? 
        new Date((item['TarihGun'] || item['Tarih']).split(' - ')[0]).toLocaleDateString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit' 
        }) : '',
      dayOfWeek: (item['TarihGun'] || item['Tarih']) ? 
        new Date((item['TarihGun'] || item['Tarih']).split(' - ')[0]).toLocaleDateString('tr-TR', { weekday: 'short' }) : ''
    }))
    
    // En iyi müşteriler (Frontend formatına uygun - Firma bazlı)
    const customerTotals = dataArray.reduce((acc: any, item: any) => {
      const firma = item['Firma'] || 'Bilinmeyen'
      acc[firma] = (acc[firma] || 0) + (item['Tutar'] || item['GENEL_TOPLAM'] || 0)
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
      acc[firma].revenue += item['Tutar'] || item['GENEL_TOPLAM'] || 0
      acc[firma].customers += item['Musteri Sayisi'] || 0
      return acc
    }, {})
    
    const companyPerformance = Object.entries(companyData)
      .map(([company, data]: any) => ({
          company,
          revenue: data.revenue,
          customers: data.customers,
          marketShare: totals.genelToplam > 0 ? (data.revenue / totals.genelToplam) * 100 : 0
      }))
      .sort((a, b) => b.marketShare - a.marketShare)
    
    // Aylık karşılaştırma verileri - GEÇİCİ OLARAK DEVRE DIŞI (PERFORMANS)
    // const monthlyComparison = monthlyReport 
    //   ? await generateYearlyComparisonFromMonthlyAPI(monthlyReport, request)
    //   : generateMonthlyComparisonFromData(dataArray)
    const monthlyComparison = generateMonthlyComparisonFromData(dataArray) // Sadece mevcut veriden hesapla
    
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
      customerRevenueData,
      DATAS: dataArray  // Ham veri - Analytics sayfası için
    }
    
  } catch (error: any) {
    console.error('❌ Error processing dashboard data:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error
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
  
  
  try {
    // 2025 yılı için API çağrısı (YIL: "2025" string olarak)
    const currentYearData = await fetchYearTotalByYear(monthlyReport, currentYear.toString(), request)
    
    // 2024 yılı için API çağrısı (YIL: "2024" string olarak)
    const previousYearData = await fetchYearTotalByYear(monthlyReport, (currentYear - 1).toString(), request)
    
    
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
  
  
  return monthlyData
}

