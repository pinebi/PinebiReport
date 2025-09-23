import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id
    
    console.log('🔄 Fetching category:', categoryId)
    
    // Get category details
    const category = {
      id: categoryId,
      name: categoryId === 'cat-1' ? 'Satış Raporları' : 
            categoryId === 'cat-2' ? 'Finansal Raporlar' :
            categoryId === 'cat-3' ? 'Aylık Satış' :
            categoryId === 'cat-4' ? 'Günlük Satış' : 'Bilinmeyen Kategori',
      description: categoryId === 'cat-1' ? 'Satış performansı ve analiz raporları' : 
                   categoryId === 'cat-2' ? 'Muhasebe ve finansal analiz raporları' :
                   categoryId === 'cat-3' ? 'Aylık satış performans raporları' :
                   categoryId === 'cat-4' ? 'Günlük satış detay raporları' : 'Kategori açıklaması',
      icon: categoryId === 'cat-1' ? '📊' : 
            categoryId === 'cat-2' ? '💰' :
            categoryId === 'cat-3' ? '📈' :
            categoryId === 'cat-4' ? '📅' : '📄',
      color: categoryId === 'cat-1' ? '#3B82F6' : 
             categoryId === 'cat-2' ? '#8B5CF6' :
             categoryId === 'cat-3' ? '#10B981' :
             categoryId === 'cat-4' ? '#F59E0B' : '#6B7280',
      sortOrder: 1,
      isActive: true,
      parentId: categoryId === 'cat-3' || categoryId === 'cat-4' ? 'cat-1' : null
    }
    
    console.log('📊 Category found:', category.name)
    
    return NextResponse.json({ category })
  } catch (error) {
    console.error('❌ Category fetch error:', error)
    return NextResponse.json(
      { error: 'Kategori getirilirken hata oluştu', details: error.message },
      { status: 500 }
    )
  }
}