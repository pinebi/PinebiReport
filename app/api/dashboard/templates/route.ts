import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const templates = [
      // KPI Widgets
      {
        id: 'kpi-sales',
        name: 'Satış KPI',
        description: 'Günlük, aylık satış metrikleri',
        widgetType: 'kpi',
        icon: 'DollarSign',
        category: 'financial',
        config: {
          defaultWidth: 400,
          defaultHeight: 200,
          dataSource: '/api/dashboard/data/kpi-sales',
          metrics: ['totalSales', 'dailySales', 'monthlySales']
        },
        preview: '💰 Satış metrikleri',
        isActive: true
      },
      {
        id: 'kpi-customers',
        name: 'Müşteri KPI',
        description: 'Müşteri sayısı ve büyüme oranları',
        widgetType: 'kpi',
        icon: 'Users',
        category: 'analytics',
        config: {
          defaultWidth: 400,
          defaultHeight: 200,
          dataSource: '/api/dashboard/data/kpi-customers',
          metrics: ['totalCustomers', 'newCustomers', 'retentionRate']
        },
        preview: '👥 Müşteri metrikleri',
        isActive: true
      },

      // Chart Widgets
      {
        id: 'chart-sales-trend',
        name: 'Satış Trend Grafiği',
        description: 'Zaman bazlı satış analizi',
        widgetType: 'chart',
        icon: 'BarChart3',
        category: 'analytics',
        config: {
          defaultWidth: 600,
          defaultHeight: 300,
          dataSource: '/api/dashboard/data/sales-trend',
          chartType: 'line',
          xAxis: 'date',
          yAxis: 'amount'
        },
        preview: '📈 Satış trend grafiği',
        isActive: true
      },
      {
        id: 'chart-payment-methods',
        name: 'Ödeme Yöntemleri',
        description: 'Ödeme türlerine göre dağılım',
        widgetType: 'gauge',
        icon: 'PieChart',
        category: 'financial',
        config: {
          defaultWidth: 400,
          defaultHeight: 300,
          dataSource: '/api/dashboard/data/payment-methods',
          chartType: 'pie'
        },
        preview: '🥧 Ödeme dağılımı',
        isActive: true
      },

      // Table Widgets
      {
        id: 'table-top-customers',
        name: 'En İyi Müşteriler',
        description: 'En yüksek cirolu müşteriler listesi',
        widgetType: 'table',
        icon: 'TrendingUp',
        category: 'sales',
        config: {
          defaultWidth: 500,
          defaultHeight: 400,
          dataSource: '/api/dashboard/data/top-customers',
          columns: ['name', 'totalSales', 'orders']
        },
        preview: '🏆 En iyi müşteriler',
        isActive: true
      },

      // Progress Widgets
      {
        id: 'progress-monthly-goal',
        name: 'Aylık Hedef İlerlemesi',
        description: 'Aylık satış hedefi takibi',
        widgetType: 'progress',
        icon: 'Activity',
        category: 'sales',
        config: {
          defaultWidth: 400,
          defaultHeight: 150,
          dataSource: '/api/dashboard/data/monthly-goal',
          goal: 100000,
          current: 75000
        },
        preview: '🎯 Hedef ilerlemesi',
        isActive: true
      },

      // Content Widgets
      {
        id: 'text-welcome',
        name: 'Hoş Geldiniz Metni',
        description: 'Özelleştirilebilir metin widget',
        widgetType: 'text',
        icon: 'FileText',
        category: 'custom',
        config: {
          defaultWidth: 400,
          defaultHeight: 200,
          content: '<h2>Hoş Geldiniz!</h2><p>Dashboard\'ınıza hoş geldiniz.</p>',
          fontSize: '14px',
          textAlign: 'left'
        },
        preview: '📝 Metin widget',
        isActive: true
      },
      {
        id: 'image-logo',
        name: 'Logo/Resim',
        description: 'Şirket logosu veya resim widget',
        widgetType: 'image',
        icon: 'Image',
        category: 'custom',
        config: {
          defaultWidth: 300,
          defaultHeight: 200,
          src: '/placeholder-logo.png',
          alt: 'Company Logo'
        },
        preview: '🖼️ Resim widget',
        isActive: true
      },
      {
        id: 'iframe-external',
        name: 'Harici İçerik',
        description: 'Dış web sitesi içeriği',
        widgetType: 'iframe',
        icon: 'Globe',
        category: 'custom',
        config: {
          defaultWidth: 600,
          defaultHeight: 400,
          src: 'https://example.com',
          title: 'External Content'
        },
        preview: '🌐 Harici içerik',
        isActive: true
      },

      // Advanced Widgets
      {
        id: 'realtime-sales',
        name: 'Gerçek Zamanlı Satış',
        description: 'Canlı satış verileri ve trend analizi',
        widgetType: 'chart',
        icon: 'Activity',
        category: 'analytics',
        config: {
          defaultWidth: 600,
          defaultHeight: 400,
          chartType: 'line',
          dataSource: '/api/dashboard/data/realtime-sales',
          realtime: true,
          refreshRate: 5000
        },
        preview: '📊 Canlı satış verileri',
        isActive: true
      },
      {
        id: 'comparison-widget',
        name: 'Dönem Karşılaştırması',
        description: 'Farklı dönemlerin karşılaştırmalı analizi',
        widgetType: 'chart',
        icon: 'TrendingUp',
        category: 'analytics',
        config: {
          defaultWidth: 800,
          defaultHeight: 500,
          chartType: 'bar',
          dataSource: '/api/dashboard/data/comparison',
          comparison: true
        },
        preview: '📈 Dönem karşılaştırması',
        isActive: true
      },
      {
        id: 'heatmap-widget',
        name: 'Isı Haritası',
        description: 'Veri yoğunluğu görselleştirmesi',
        widgetType: 'chart',
        icon: 'Grid3X3',
        category: 'analytics',
        config: {
          defaultWidth: 500,
          defaultHeight: 400,
          chartType: 'heatmap',
          dataSource: '/api/dashboard/data/heatmap'
        },
        preview: '🔥 Isı haritası',
        isActive: true
      },
      {
        id: 'funnel-widget',
        name: 'Huni Analizi',
        description: 'Müşteri dönüşüm hunisi',
        widgetType: 'chart',
        icon: 'Filter',
        category: 'marketing',
        config: {
          defaultWidth: 600,
          defaultHeight: 400,
          chartType: 'funnel',
          dataSource: '/api/dashboard/data/funnel'
        },
        preview: '🎯 Huni analizi',
        isActive: true
      },
      {
        id: 'sankey-widget',
        name: 'Sankey Diyagramı',
        description: 'Veri akışı görselleştirmesi',
        widgetType: 'chart',
        icon: 'GitBranch',
        category: 'analytics',
        config: {
          defaultWidth: 800,
          defaultHeight: 500,
          chartType: 'sankey',
          dataSource: '/api/dashboard/data/sankey'
        },
        preview: '🌊 Veri akışı',
        isActive: true
      },
      {
        id: 'gauge-speedometer',
        name: 'Hız Göstergesi',
        description: 'Performans göstergesi',
        widgetType: 'gauge',
        icon: 'Gauge',
        category: 'operations',
        config: {
          defaultWidth: 300,
          defaultHeight: 300,
          chartType: 'speedometer',
          dataSource: '/api/dashboard/data/gauge',
          min: 0,
          max: 100
        },
        preview: '⚡ Hız göstergesi',
        isActive: true
      },
      {
        id: 'weather-widget',
        name: 'Hava Durumu',
        description: 'Güncel hava durumu bilgileri',
        widgetType: 'text',
        icon: 'Cloud',
        category: 'custom',
        config: {
          defaultWidth: 300,
          defaultHeight: 200,
          apiKey: 'weather-api-key',
          location: 'Istanbul'
        },
        preview: '☁️ Hava durumu',
        isActive: true
      },
      {
        id: 'news-widget',
        name: 'Haber Akışı',
        description: 'Güncel haberler ve duyurular',
        widgetType: 'text',
        icon: 'Newspaper',
        category: 'custom',
        config: {
          defaultWidth: 400,
          defaultHeight: 500,
          rssUrl: 'https://example.com/news.rss',
          maxItems: 10
        },
        preview: '📰 Haber akışı',
        isActive: true
      }
    ]

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
