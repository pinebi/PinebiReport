import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, dashboardData, reports, userContext } = await request.json()

    // OpenAI API Key kontrolü
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      // API key yoksa fallback logic kullan
      return NextResponse.json({
        success: true,
        message: getFallbackResponse(messages[messages.length - 1]?.content, dashboardData, reports, userContext),
        source: 'fallback'
      })
    }

    // System prompt oluştur
    const systemPrompt = buildSystemPrompt(dashboardData, reports, userContext)

    // OpenAI API'ye istek gönder
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || 'Üzgünüm, cevap oluşturamadım.'

    return NextResponse.json({
      success: true,
      message: aiMessage,
      source: 'openai'
    })

  } catch (error: any) {
    console.error('❌ AI Chat error:', error.message)
    
    // Hata durumunda fallback kullan
    const { messages, dashboardData, reports, userContext } = await request.json()
    return NextResponse.json({
      success: true,
      message: getFallbackResponse(messages[messages.length - 1]?.content, dashboardData, reports, userContext),
      source: 'fallback'
    })
  }
}

function buildSystemPrompt(dashboardData: any, reports: any[], userContext: any): string {
  const firma = userContext?.firma || 'Firma'
  const userName = userContext?.userName || 'Kullanıcı'
  const startDate = userContext?.startDate || 'Belirtilmemiş'
  const endDate = userContext?.endDate || 'Belirtilmemiş'
  
  let prompt = `Sen ${firma} firması için bir dashboard asistanı olan yapay zeka botusun. Adın "PineBI Asistanı".\n\n`
  
  prompt += `KULLANICI BİLGİLERİ:\n`
  prompt += `- Firma: ${firma}\n`
  prompt += `- Kullanıcı: ${userName}\n`
  prompt += `- Rol: ${userContext?.role || 'Kullanıcı'}\n`
  prompt += `- Tarih Aralığı: ${startDate} / ${endDate}\n\n`
  
  prompt += `ÖNEMLİ: ${firma} firması için ${firma.toUpperCase()} raporlarını kullan.\n`
  prompt += `- RMK firması ise "Satış Raporu RMK" API'sini kullan\n`
  prompt += `- BELPAS firması ise "Satış Raporu BELPAS" API'sini kullan\n\n`
  
  if (dashboardData) {
    prompt += `GÜNCEL DASHBOARD VERİLERİ:\n`
    
    if (dashboardData.kpiData) {
      const kpi = dashboardData.kpiData
      prompt += `- Toplam Ciro: ${formatCurrency(kpi.toplamCiro)}\n`
      prompt += `- Nakit: ${formatCurrency(kpi.nakit)}\n`
      prompt += `- Kredi Kartı: ${formatCurrency(kpi.krediKarti)}\n`
      prompt += `- Açık Hesap: ${formatCurrency(kpi.acikHesap)}\n\n`
    }
    
    if (dashboardData.topCustomers && dashboardData.topCustomers.length > 0) {
      prompt += `EN İYİ MÜŞTERİLER (Top 5):\n`
      dashboardData.topCustomers.slice(0, 5).forEach((customer: any, index: number) => {
        prompt += `${index + 1}. ${customer.name}: ${formatCurrency(customer.amount)}\n`
      })
      prompt += `\n`
    }
    
    if (dashboardData.companyPerformance && dashboardData.companyPerformance.length > 0) {
      prompt += `FİRMA PERFORMANSI (Top 5):\n`
      dashboardData.companyPerformance.slice(0, 5).forEach((company: any, index: number) => {
        prompt += `${index + 1}. ${company.company}: ${formatCurrency(company.revenue)} (${company.marketShare.toFixed(1)}% pazar payı)\n`
      })
      prompt += `\n`
    }
  }
  
  if (reports && reports.length > 0) {
    prompt += `MEVCUT RAPORLAR (${reports.length} adet):\n`
    reports.slice(0, 10).forEach((report: any, index: number) => {
      prompt += `${index + 1}. ${report.name} - ${report.category?.name || 'Kategori yok'}\n`
    })
    if (reports.length > 10) {
      prompt += `... ve ${reports.length - 10} rapor daha\n`
    }
    prompt += `\n`
  }
  
  prompt += `GÖREVİN:\n`
  prompt += `1. Kullanıcının sorularını Türkçe olarak cevapla\n`
  prompt += `2. Dashboard verilerini ve raporları kullanarak bilgilendirici cevaplar ver\n`
  prompt += `3. Sayısal verileri Türk Lirası formatında göster (örn: 1.234.567₺)\n`
  prompt += `4. Kısa, net ve profesyonel bir dil kullan\n`
  prompt += `5. Eğer bir veri yoksa veya bilemiyorsan, bunu açıkça belirt\n`
  prompt += `6. Rapor isimleri sorarsa, yukarıdaki rapor listesinden bahset\n`
  prompt += `7. Karşılaştırma, trend analizi ve öneriler yapabilirsin\n\n`
  
  prompt += `NOT: Sadece dashboard ve raporlar hakkında konuş. Başka konularda yardımcı olamazsın.`
  
  return prompt
}

function getFallbackResponse(query: string, dashboardData: any, reports: any[], userContext: any): string {
  if (!query) return 'Lütfen bir soru sorun.'
  
  const lowerQuery = query.toLowerCase()
  const firma = userContext?.firma || 'Firma'
  const startDate = userContext?.startDate || ''
  const endDate = userContext?.endDate || ''
  
  // Tarih formatı
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  }
  
  const dateRangeText = startDate && endDate 
    ? `\n📅 Tarih: ${startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}`
    : ''
  
  // Rapor listesi
  if (lowerQuery.includes('rapor') && (lowerQuery.includes('hangi') || lowerQuery.includes('liste') || lowerQuery.includes('neler'))) {
    if (reports && reports.length > 0) {
      let response = `📊 ${firma} için ${reports.length} rapor bulunuyor:\n\n`
      reports.slice(0, 10).forEach((report: any, index: number) => {
        response += `${index + 1}. ${report.name}\n`
      })
      if (reports.length > 10) {
        response += `\n... ve ${reports.length - 10} rapor daha`
      }
      return response
    }
    return 'Şu anda görüntüleyebileceğiniz rapor bulunmuyor.'
  }
  
  // Ciro soruları
  if (lowerQuery.includes('ciro') || lowerQuery.includes('satış') || lowerQuery.includes('toplam')) {
    if (dashboardData?.kpiData) {
      const kpi = dashboardData.kpiData
      return `💰 ${firma} - Toplam Ciro: ${formatCurrency(kpi.toplamCiro)}${dateRangeText}\n\n` +
             `• Nakit: ${formatCurrency(kpi.nakit)}\n` +
             `• Kredi Kartı: ${formatCurrency(kpi.krediKarti)}\n` +
             `• Açık Hesap: ${formatCurrency(kpi.acikHesap)}\n\n` +
             `ℹ️ ${firma} firması için ${firma === 'RMK' ? 'Satış Raporu RMK' : firma === 'BELPAS' ? 'Satış Raporu BELPAS' : 'ilgili'} API kullanıldı.`
    }
    return 'Ciro bilgisi şu anda yüklenemedi.'
  }
  
  // Müşteri soruları
  if (lowerQuery.includes('müşteri') || lowerQuery.includes('musteri') || lowerQuery.includes('en iyi') || lowerQuery.includes('en çok')) {
    if (dashboardData?.topCustomers && dashboardData.topCustomers.length > 0) {
      let response = `🏆 En İyi Müşteriler:\n\n`
      dashboardData.topCustomers.slice(0, 5).forEach((customer: any, index: number) => {
        response += `${index + 1}. ${customer.name}: ${formatCurrency(customer.amount)}\n`
      })
      return response
    }
    return 'Müşteri bilgisi şu anda yüklenemedi.'
  }
  
  // Genel yanıt
  return `Merhaba! 👋\n\n` +
         `Ben ${firma} için dashboard asistanınızım. Size şu konularda yardımcı olabilirim:\n\n` +
         `• Dashboard verileri (ciro, satışlar, müşteriler)\n` +
         `• Raporlar listesi ve detayları\n` +
         `• Trend analizleri ve karşılaştırmalar\n` +
         `• İstatistikler ve özetler\n\n` +
         `Bir soru sorun, size yardımcı olayım!`
}

function formatCurrency(value: number): string {
  if (!value && value !== 0) return '0₺'
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}






