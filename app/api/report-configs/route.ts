import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('=== API GET /api/report-configs ===')
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    console.log('Category ID:', categoryId)
    
    let reports
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
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: categoryId, name: categoryName }
        }
      ]
      console.log('📊 Using mock reports for category:', categoryId, 'Count:', reports.length)
    } else {
      console.log('Fetching all reports...')
      try {
        reports = await db.reportConfig.findAll()
      } catch (error) {
        console.warn('Database fetch failed, using mock data:', error.message)
        reports = []
      }
    }
    // project showInMenu from headers JSON (default true)
    const projected = (reports || []).map((r: any) => {
      let showInMenu = true
      try {
        const h = typeof r.headers === 'string' ? JSON.parse(r.headers) : r.headers
        if (h && typeof h.showInMenu !== 'undefined') showInMenu = !!h.showInMenu
      } catch {}
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
    return NextResponse.json(
      { error: 'Rapor oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

