import { NextRequest, NextResponse } from 'next/server'
import { invoiceFlags } from '@/lib/sqlserver'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle get action for multiple IDs
    if (body.action === 'get' && body.ids) {
      const ids = Array.isArray(body.ids) ? body.ids : [body.ids]
      const rows = await invoiceFlags.findByIds(ids)
      const processedIds = rows.filter((row: any) => row.isProcessed === true).map((row: any) => row.recordId).filter(Boolean)
      return NextResponse.json({ success: true, processedIds })
    }
    
    // Handle set action for single ID
    const { id, isProcessed } = body
    
    if (!id || typeof isProcessed === 'undefined') {
      return NextResponse.json({ error: 'id ve isProcessed zorunludur' }, { status: 400 })
    }
    const result = await invoiceFlags.upsert(String(id), !!isProcessed)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Invoice flag error:', error)
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    const ids = idsParam ? idsParam.split(',').map(s => s.trim()).filter(Boolean) : []
    if (ids.length === 0) {
      return NextResponse.json({ flags: [] })
    }
    const rows = await invoiceFlags.findByIds(ids)
    return NextResponse.json({ flags: rows })
  } catch (error) {
    console.error('Invoice flags fetch error:', error)
    return NextResponse.json({ error: 'Kayıtlar getirilemedi' }, { status: 500 })
  }
}


