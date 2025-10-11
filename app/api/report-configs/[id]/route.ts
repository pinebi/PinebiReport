import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Fetching report config for ID:', params.id)
    const report = await db.reportConfig.findById(params.id)
    
    if (!report) {
      console.log('Report not found for ID:', params.id)
      return NextResponse.json({ error: 'Report config not found' }, { status: 404 })
    }
    
    console.log('Report found:', report.name)
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error fetching report config:', error)
    console.error('Error details:', {
      id: params.id,
      error: error instanceof Error ? error.message : error
    })
    return NextResponse.json({ error: 'Failed to fetch report config' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    console.log('🔄 PUT /api/report-configs/[id] - Report ID:', params.id)
    console.log('📦 Request data:', {
      name: data.name,
      categoryId: data.categoryId,
      companyId: data.companyId,
      userId: data.userId,
      isActive: data.isActive,
      showInMenu: data.showInMenu
    })
    
    // Parse headers if it's a string, otherwise use as object
    let headersData: any = {}
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
    // ensure showInMenu persisted
    try {
      headersData.showInMenu = data.showInMenu === true
    } catch {}
    
    const updateData: any = {
      name: data.name,
      description: data.description,
      endpointUrl: data.endpointUrl,
      apiUsername: data.apiUsername,
      apiPassword: data.apiPassword,
      headers: JSON.stringify(headersData),
      isActive: data.isActive
    }

    if (data.categoryId) {
      console.log('📂 Updating category to:', data.categoryId)
      // Map mock ids to DB categories if needed
      try {
        let catId = data.categoryId
        if (typeof catId === 'string' && catId.startsWith('cat-')) {
          const mockName = catId === 'cat-satis' ? 'Satış Raporları' : (catId === 'cat-finansal' ? 'Finansal Raporlar' : null)
          if (mockName) {
            const allCats = await db.reportCategory.findAll()
            const found = allCats.find((c: any) => c.name === mockName)
            if (found) catId = found.id
          }
        }
        updateData.category = { connect: { id: catId } }
      } catch {
        updateData.category = { connect: { id: data.categoryId } }
      }
    }
    if (data.companyId) {
      updateData.company = { connect: { id: data.companyId } }
    }
    if (data.userId) {
      updateData.user = { connect: { id: data.userId } }
    }

    // optional FK validation to return clearer messages
    try {
      if (data.categoryId) {
        const cat = await db.reportCategory.findById(data.categoryId)
        if (!cat) return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 400 })
      }
      if (data.companyId) {
        const comp = await db.company.findById(data.companyId)
        if (!comp) return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 400 })
      }
      if (data.userId) {
        const usr = await db.user.findById(data.userId)
        if (!usr) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 })
      }
    } catch (e) {
      console.error('FK validation (PUT) error:', e)
    }

    console.log('💾 Final updateData:', updateData)
    
    const report = await db.reportConfig.update(params.id, updateData)
    
    console.log('✅ Report updated successfully:', report.id)
    
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error updating report config:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Rapor güncellenemedi: ' + error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to update report config' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.reportConfig.delete(params.id)
    return NextResponse.json({ message: 'Report config deleted successfully' })
  } catch (error) {
    console.error('Error deleting report config:', error)
    return NextResponse.json({ error: 'Failed to delete report config' }, { status: 500 })
  }
}
