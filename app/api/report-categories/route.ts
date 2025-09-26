import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔄 Fetching report categories...')
    
    let categories: any[] = []
    try {
      categories = await db.reportCategory.findAll()
    } catch (e) {
      console.warn('⚠️ DB categories fetch failed, falling back to mock:', (e as any)?.message)
    }
    
    if (!categories || categories.length === 0) {
      // Fallback mock categories
      categories = [
        {
          id: 'cat-satis',
          name: 'Satış Raporları',
          description: 'Satış performansı ve analiz raporları',
          icon: '📊',
          color: '#3B82F6',
          sortOrder: 1,
          isActive: true,
          parentId: null
        },
        {
          id: 'cat-finansal',
          name: 'Finansal Raporlar',
          description: 'Muhasebe ve finansal analiz raporları',
          icon: '💰',
          color: '#8B5CF6',
          sortOrder: 2,
          isActive: true,
          parentId: null
        }
      ]
    }

    console.log('📊 Returning categories:', categories.length)
    
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('❌ Report categories fetch error:', error)
    return NextResponse.json(
      { error: 'Kategoriler getirilirken hata oluştu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const category = await db.reportCategory.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
        icon: data.icon,
        color: data.color,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Report category creation error:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

