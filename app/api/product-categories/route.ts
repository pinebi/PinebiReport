import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const encodedToken = authHeader.split(' ')[1]
    const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8')
    const [userId] = decodedToken.split(':')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {
      companyId: user.companyId
    }

    if (!includeInactive) {
      where.isActive = true
    }

    const categories = await prisma.productCategory.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching product categories:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const encodedToken = authHeader.split(' ')[1]
    const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8')
    const [userId] = decodedToken.split(':')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const categoryData = await request.json()

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 })
    }

    // Check if parent category exists and belongs to same company
    if (categoryData.parentId) {
      const parentCategory = await prisma.productCategory.findFirst({
        where: {
          id: categoryData.parentId,
          companyId: user.companyId
        }
      })

      if (!parentCategory) {
        return NextResponse.json({ 
          success: false, 
          error: 'Parent category not found' 
        }, { status: 400 })
      }
    }

    // Create category
    const category = await prisma.productCategory.create({
      data: {
        ...categoryData,
        companyId: user.companyId
      },
      include: {
        parent: true,
        children: true
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating product category:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}













