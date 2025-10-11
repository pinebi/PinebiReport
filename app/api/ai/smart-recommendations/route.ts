import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, userRole } = await request.json()

    console.log('🤖 Smart Recommendations API Request:', { userId, companyId, userRole })

    // Kullanıcının son erişim geçmişini al
    const userAccessHistory = await prisma.reportExecution.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Son 30 gün
        }
      },
      include: {
        report: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // En çok kullanılan kategorileri analiz et
    const categoryUsage = userAccessHistory.reduce((acc: any, execution) => {
      const categoryId = execution.report.categoryId
      acc[categoryId] = (acc[categoryId] || 0) + 1
      return acc
    }, {})

    // Kullanıcının erişim yetkisi olan raporları al
    const availableReports = await prisma.reportConfig.findMany({
      where: {
        isActive: true,
        showInMenu: true,
        OR: [
          { userId: userId },
          { companyId: companyId },
          ...(userRole === 'ADMIN' ? [{}] : [])
        ]
      },
      include: {
        category: true,
        company: true
      }
    })

    // Akıllı öneriler oluştur
    const recommendations = []

    // 1. En çok kullanılan kategoriden öneriler
    const topCategory = Object.keys(categoryUsage).reduce((a, b) => 
      categoryUsage[a] > categoryUsage[b] ? a : b, ''
    )

    if (topCategory) {
      const categoryReports = availableReports.filter(r => r.categoryId === topCategory)
      recommendations.push({
        type: 'category_based',
        title: 'Sık Kullandığınız Kategoriden',
        description: `${categoryReports[0]?.category?.name} kategorisinden yeni raporlar`,
        reports: categoryReports.slice(0, 3),
        priority: 'high'
      })
    }

    // 2. Son kullanılan raporlara benzer öneriler
    const recentReports = userAccessHistory.slice(0, 5).map(e => e.report)
    const similarReports = availableReports.filter(r => 
      !recentReports.some(recent => recent.id === r.id) &&
      recentReports.some(recent => recent.categoryId === r.categoryId)
    )

    if (similarReports.length > 0) {
      recommendations.push({
        type: 'similar_reports',
        title: 'Benzer Raporlar',
        description: 'Son kullandığınız raporlara benzer öneriler',
        reports: similarReports.slice(0, 3),
        priority: 'medium'
      })
    }

    // 3. Yeni eklenen raporlar
    const newReports = availableReports.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Son 7 gün
    )

    if (newReports.length > 0) {
      recommendations.push({
        type: 'new_reports',
        title: 'Yeni Eklenen Raporlar',
        description: 'Son eklenen raporlar',
        reports: newReports.slice(0, 3),
        priority: 'medium'
      })
    }

    // 4. Trend analizi önerileri
    const trendReports = availableReports.filter(r => 
      r.name.toLowerCase().includes('trend') ||
      r.name.toLowerCase().includes('analiz') ||
      r.name.toLowerCase().includes('karşılaştırma')
    )

    if (trendReports.length > 0) {
      recommendations.push({
        type: 'trend_analysis',
        title: 'Trend Analizi',
        description: 'Veri analizi ve trend raporları',
        reports: trendReports.slice(0, 3),
        priority: 'low'
      })
    }

    console.log('✅ Smart recommendations generated:', recommendations.length)

    return NextResponse.json({
      success: true,
      recommendations,
      userStats: {
        totalAccess: userAccessHistory.length,
        topCategory: topCategory,
        recentActivity: userAccessHistory.length > 0
      }
    })

  } catch (error: any) {
    console.error('❌ Smart Recommendations API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}


