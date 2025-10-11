import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, companyId, context = 'general' } = await request.json()

    console.log('🤖 Enhanced Chatbot API Request:', { userId, companyId, context, messageLength: message.length })

    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const firma = user.company?.name || 'RMK'

    // Mesaj analizi ve context belirleme
    let detectedContext = context
    let actionType = 'chat'
    let responseData = null

    // Dashboard verisi gerektiren sorular
    if (message.toLowerCase().includes('satış') || 
        message.toLowerCase().includes('ciro') || 
        message.toLowerCase().includes('müşteri') ||
        message.toLowerCase().includes('bugün') ||
        message.toLowerCase().includes('bu hafta') ||
        message.toLowerCase().includes('bu ay')) {
      
      detectedContext = 'dashboard'
      actionType = 'data_query'
      
      // Tarih aralığını belirle
      let startDate = new Date().toISOString().split('T')[0]
      let endDate = new Date().toISOString().split('T')[0]
      
      if (message.toLowerCase().includes('hafta')) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        startDate = weekAgo.toISOString().split('T')[0]
      } else if (message.toLowerCase().includes('ay')) {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        startDate = monthAgo.toISOString().split('T')[0]
      }

      // Dashboard verilerini al
      try {
        const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            companyId,
            startDate,
            endDate,
            firma
          })
        })

        const dashboardData = await dashboardResponse.json()
        
        if (dashboardData.success) {
          responseData = dashboardData.data
        }
      } catch (error) {
        console.log('⚠️ Dashboard data fetch failed:', error)
      }
    }

    // Rapor önerileri
    if (message.toLowerCase().includes('rapor') || 
        message.toLowerCase().includes('öner') ||
        message.toLowerCase().includes('hangi')) {
      
      detectedContext = 'reports'
      actionType = 'recommendations'
      
      try {
        const recommendationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/smart-recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            companyId,
            userRole: user.role
          })
        })

        const recommendationsData = await recommendationsResponse.json()
        
        if (recommendationsData.success) {
          responseData = recommendationsData
        }
      } catch (error) {
        console.log('⚠️ Recommendations fetch failed:', error)
      }
    }

    // Anomali tespiti
    if (message.toLowerCase().includes('sorun') || 
        message.toLowerCase().includes('hata') ||
        message.toLowerCase().includes('anomali') ||
        message.toLowerCase().includes('kontrol')) {
      
      detectedContext = 'anomaly'
      actionType = 'anomaly_check'
      
      try {
        const anomalyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/anomaly-detection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            companyId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          })
        })

        const anomalyData = await anomalyResponse.json()
        
        if (anomalyData.success) {
          responseData = anomalyData
        }
      } catch (error) {
        console.log('⚠️ Anomaly detection failed:', error)
      }
    }

    // AI yanıtı oluştur
    let aiResponse = ''
    
    if (actionType === 'data_query' && responseData) {
      const kpiData = responseData.kpiData || []
      const salesData = kpiData.find((item: any) => item.title === 'Günlük Satış')
      const customerData = kpiData.find((item: any) => item.title === 'Toplam Müşteri')
      
      if (salesData) {
        aiResponse += `📊 **${firma} Firması Güncel Verileri:**\n\n`
        aiResponse += `💰 **Günlük Satış:** ${salesData.value.toLocaleString()} TL\n`
        if (customerData) {
          aiResponse += `👥 **Toplam Müşteri:** ${customerData.value.toLocaleString()}\n`
        }
        aiResponse += `\n📅 **Tarih Aralığı:** ${startDate} - ${endDate}\n\n`
      }
      
      // Mesaja özel yanıt
      if (message.toLowerCase().includes('nasıl')) {
        aiResponse += `💡 **Değerlendirme:**\n`
        if (salesData && salesData.value > 0) {
          aiResponse += `• Satışlar aktif durumda\n`
          aiResponse += `• Günlük performans normal seviyede\n`
        } else {
          aiResponse += `• Satış verileri henüz güncellenmedi\n`
          aiResponse += `• Lütfen birkaç dakika sonra tekrar kontrol edin\n`
        }
      }
    } else if (actionType === 'recommendations' && responseData) {
      aiResponse += `🎯 **Akıllı Rapor Önerileri:**\n\n`
      
      responseData.recommendations.forEach((rec: any, index: number) => {
        aiResponse += `${index + 1}. **${rec.title}**\n`
        aiResponse += `   ${rec.description}\n`
        if (rec.reports && rec.reports.length > 0) {
          rec.reports.forEach((report: any) => {
            aiResponse += `   • ${report.name}\n`
          })
        }
        aiResponse += `\n`
      })
    } else if (actionType === 'anomaly_check' && responseData) {
      if (responseData.anomalies && responseData.anomalies.length > 0) {
        aiResponse += `⚠️ **Anomali Tespiti:**\n\n`
        responseData.anomalies.forEach((anomaly: any, index: number) => {
          aiResponse += `${index + 1}. **${anomaly.title}** (${anomaly.severity})\n`
          aiResponse += `   ${anomaly.description}\n`
          aiResponse += `   💡 ${anomaly.recommendation}\n\n`
        })
      } else {
        aiResponse += `✅ **Sistem Durumu:**\n\n`
        aiResponse += `• Herhangi bir anomali tespit edilmedi\n`
        aiResponse += `• Sistem normal çalışıyor\n`
        aiResponse += `• Veri kalitesi iyi durumda\n`
      }
    } else {
      // Genel sohbet yanıtı
      aiResponse = `Merhaba ${user.firstName}! 👋\n\n`
      aiResponse += `Ben ${firma} firması için gelişmiş AI asistanınızım. Size şu konularda yardımcı olabilirim:\n\n`
      aiResponse += `📊 **Dashboard Verileri**\n`
      aiResponse += `• "Bugünkü satışlar nasıl?"\n`
      aiResponse += `• "Bu hafta ciromuz ne kadar?"\n\n`
      aiResponse += `🎯 **Akıllı Öneriler**\n`
      aiResponse += `• "Hangi raporları önerirsin?"\n`
      aiResponse += `• "Benzer raporlar var mı?"\n\n`
      aiResponse += `🔍 **Sistem Kontrolü**\n`
      aiResponse += `• "Sistemde sorun var mı?"\n`
      aiResponse += `• "Veri kalitesi nasıl?"\n\n`
      aiResponse += `Bir soru sorun, size yardımcı olayım! 😊`
    }

    // Chat geçmişini kaydet
    try {
      await prisma.chatHistory.create({
        data: {
          userId,
          companyId,
          message,
          response: aiResponse,
          context: detectedContext,
          actionType,
          createdAt: new Date()
        }
      })
    } catch (dbError) {
      console.log('⚠️ ChatHistory table not found, skipping save')
    }

    console.log('✅ Enhanced chatbot response generated')

    return NextResponse.json({
      success: true,
      response: aiResponse,
      context: detectedContext,
      actionType,
      hasData: !!responseData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Enhanced Chatbot API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}


