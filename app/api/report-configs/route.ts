import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('=== API GET /api/report-configs ===')
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const companyId = searchParams.get('companyId')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    
    console.log('Query params:', { categoryId, companyId, userId, userRole })
    
    let reports: any[]
    if (categoryId) {
      console.log('Fetching reports by category...')
      
      // Use mock data for now
      const categoryName = categoryId === 'cat-1' ? 'Satış Raporları' : 
                           categoryId === 'cat-2' ? 'Finansal Raporlar' :
                           categoryId === 'cat-3' ? 'Aylık Satış' :
                           categoryId === 'cat-4' ? 'Günlük Satış' : 'Kategori'
      
      reports = [
        {
          id: `report-${categoryId}-1`,
          name: `${categoryName} Özet Raporu`,
          description: `${categoryName} kategorisi için özet raporu`,
          endpointUrl: 'https://api.example.com/report-1',
          apiUsername: 'user',
          apiPassword: 'pass',
          headers: JSON.stringify({ 'Content-Type': 'application/json', showInMenu: true }),
          categoryId: categoryId,
          companyId: 'company-1',
          userId: 'user-1',
          isActive: true,
          menuGroup: 'A',
          menuOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: categoryId, name: categoryName }
        },
        {
          id: `report-${categoryId}-2`,
          name: `${categoryName} Detay Raporu`,
          description: `${categoryName} kategorisi için detay raporu`,
          endpointUrl: 'https://api.example.com/report-2',
          apiUsername: 'user',
          apiPassword: 'pass',
          headers: JSON.stringify({ 'Content-Type': 'application/json', showInMenu: true }),
          categoryId: categoryId,
          companyId: 'company-1',
          userId: 'user-1',
          isActive: true,
          menuGroup: 'B',
          menuOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: categoryId, name: categoryName }
        }
      ]
      console.log('📊 Using mock reports for category:', categoryId, 'Count:', reports.length)
    } else {
      console.log('Fetching all reports...')
      try {
        if (companyId && userId && userRole) {
          console.log('🔍 Filtering reports by company and user...')
          reports = await db.reportConfig.findByCompanyAndUser(companyId, userId, userRole)
        } else {
          reports = await db.reportConfig.findAll()
        }
      } catch (error) {
        console.warn('Database fetch failed, using mock data:', error instanceof Error ? error.message : String(error))
        reports = []
      }
      
      // Always add mock sales reports for better UX
      const mockSalesReports = [
        {
          id: 'sales-report-1',
          name: 'Günlük Satış Raporu',
          description: 'Günlük satış performansı ve detayları',
          endpointUrl: 'https://api.pinebi.com/ReportService.svc',
          apiUsername: 'PINEBI',
          apiPassword: 'e81ymAbtx1jJ8hoc8IPU79LjPemuXjok2NXYRTa51',
          headers: JSON.stringify({ 
            'Content-Type': 'application/json', 
            'Accept': 'application/json',
            'Authorization': 'Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx',
            'ENDPOINT': 'GetSalesDashboardData',
            'showInMenu': true 
          }),
          categoryId: 'cat-satis',
          companyId: 'company-1',
          userId: 'user-1',
          isActive: true,
          menuGroup: 'A',
          menuOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: 'cat-satis', name: 'Satış Raporları' }
        },
        {
          id: 'sales-report-2',
          name: 'Aylık Satış Özeti',
          description: 'Aylık satış performansı ve analizi',
          endpointUrl: 'https://api.pinebi.com/ReportService.svc',
          apiUsername: 'PINEBI',
          apiPassword: 'e81ymAbtx1jJ8hoc8IPU79LjPemuXjok2NXYRTa51',
          headers: JSON.stringify({ 
            'Content-Type': 'application/json', 
            'Accept': 'application/json',
            'Authorization': 'Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx',
            'ENDPOINT': 'GetSalesDashboardData',
            'showInMenu': true 
          }),
          categoryId: 'cat-satis',
          companyId: 'company-1',
          userId: 'user-1',
          isActive: true,
          menuGroup: 'A',
          menuOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: 'cat-satis', name: 'Satış Raporları' }
        },
        {
          id: 'sales-report-3',
          name: 'Müşteri Satış Analizi',
          description: 'Müşteri bazlı satış performansı',
          endpointUrl: 'https://api.pinebi.com/ReportService.svc',
          apiUsername: 'PINEBI',
          apiPassword: 'e81ymAbtx1jJ8hoc8IPU79LjPemuXjok2NXYRTa51',
          headers: JSON.stringify({ 
            'Content-Type': 'application/json', 
            'Accept': 'application/json',
            'Authorization': 'Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx',
            'ENDPOINT': 'GetSalesDashboardData',
            'showInMenu': true 
          }),
          categoryId: 'cat-satis',
          companyId: 'company-1',
          userId: 'user-1',
          isActive: true,
          menuGroup: 'A',
          menuOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: 'cat-satis', name: 'Satış Raporları' }
        }
      ]
      
      // Add mock sales reports if they don't exist
      const existingReportNames = reports.map((r: any) => r.name)
      const missingSalesReports = mockSalesReports.filter(mock => !existingReportNames.includes(mock.name))
      
      if (missingSalesReports.length > 0) {
        console.log('📊 Adding missing sales reports:', missingSalesReports.map(r => r.name))
        reports = [...reports, ...missingSalesReports]
      }
    }
    // project showInMenu from headers JSON (default true)
    const projected = (reports || []).map((r: any) => {
      let showInMenu = true
      try {
        const h = typeof r.headers === 'string' ? JSON.parse(r.headers) : r.headers
        if (h && typeof h.showInMenu !== 'undefined') showInMenu = !!h.showInMenu
      } catch {}
      
      // Fix category mapping for sales reports - ALL sales reports should go to sales-reports category
      if (r.name && r.name.includes('Satış') && (r.categoryId === 'finance-reports' || r.categoryId === 'cat-satis')) {
        console.log('🔄 Moving sales report to correct category:', r.name, 'from', r.categoryId, 'to sales-reports')
        return { 
          ...r, 
          showInMenu, 
          categoryId: 'sales-reports',
          category: {
            id: 'sales-reports',
            name: 'Satış Raporları',
            description: 'Satış performansı ve analiz raporları',
            icon: '📊',
            color: '#3B82F6',
            sortOrder: 1,
            isActive: true,
            parentId: null
          }
        }
      }
      
      return { ...r, showInMenu }
    })
    console.log('Reports found:', projected.length)
    console.log('First report:', projected[0])
    
    return NextResponse.json({ reports: projected })
  } catch (error) {
    console.error('Report configs fetch error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Raporlar getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Parse headers if it's a string, otherwise use as object
    let headersData = {}
    if (typeof data.headers === 'string') {
      try {
        headersData = JSON.parse(data.headers)
      } catch (e) {
        console.error('Error parsing headers:', e)
        headersData = {}
      }
    } else if (data.headers) {
      headersData = data.headers
    }

    // include showInMenu flag into headers
    (headersData as any).showInMenu = data.showInMenu === true

    // Generate unique ID
    const id = 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Validate foreign keys
    try {
      if (!data.categoryId || !data.companyId || !data.userId) {
        return NextResponse.json({ error: 'categoryId, companyId ve userId zorunlu' }, { status: 400 })
      }
      // Resolve category: support mock ids (cat-satis, cat-finansal)
      let cat = await db.reportCategory.findById(data.categoryId)
      if (!cat && typeof data.categoryId === 'string' && data.categoryId.startsWith('cat-')) {
        const mockName = data.categoryId === 'cat-satis' ? 'Satış Raporları' : (data.categoryId === 'cat-finansal' ? 'Finansal Raporlar' : null)
        if (mockName) {
          try {
            const allCats = await db.reportCategory.findAll()
            const found = allCats.find((c: any) => c.name === mockName) 
            if (found) {
              cat = { ...found, reports: [] }
              data.categoryId = found.id
            }
          } catch {}
        }
      }
      const [comp, usr] = await Promise.all([
        db.company.findById(data.companyId),
        db.user.findById(data.userId)
      ])
      if (!cat) return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 400 })
      if (!comp) return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 400 })
      if (!usr) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 })
    } catch (e) {
      console.error('FK validation error:', e)
      return NextResponse.json({ error: 'İlişkiler doğrulanamadı' }, { status: 400 })
    }

    const report = await db.reportConfig.create({
      id: id,
      name: data.name,
      description: data.description,
      endpointUrl: data.endpointUrl,
      apiUsername: data.apiUsername,
      apiPassword: data.apiPassword,
      headers: JSON.stringify(headersData),
      isActive: data.isActive !== undefined ? data.isActive : true,
      // relations
      category: { connect: { id: data.categoryId } },
      company: { connect: { id: data.companyId } },
      user: { connect: { id: data.userId } }
    })

    // project showInMenu in response
    return NextResponse.json({ report: { ...report, showInMenu: (headersData as any).showInMenu } }, { status: 201 })
  } catch (error) {
    console.error('Report config creation error:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      return NextResponse.json(
        { error: 'Rapor oluşturulurken hata: ' + error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Rapor oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

