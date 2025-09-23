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
    
    const updateData: any = {
      name: data.name,
      description: data.description,
      endpointUrl: data.endpointUrl,
      apiUsername: data.apiUsername,
      apiPassword: data.apiPassword,
      headers: JSON.stringify(headersData),
      isActive: data.isActive
    }

    // persist showInMenu inside headers JSON for compatibility
    try {
      const h = typeof data.headers === 'string' ? JSON.parse(data.headers) : (data.headers || {})
      ;(h as any).showInMenu = data.showInMenu === true
      updateData.headers = JSON.stringify(h)
    } catch {}

    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } }
    }
    if (data.companyId) {
      updateData.company = { connect: { id: data.companyId } }
    }
    if (data.userId) {
      updateData.user = { connect: { id: data.userId } }
    }

    const report = await db.reportConfig.update(params.id, updateData)
    
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error updating report config:', error)
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
