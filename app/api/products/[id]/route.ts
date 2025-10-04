import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId
      },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Parse JSON fields
    const formattedProduct = {
      ...product,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      customFields: product.customFields ? JSON.parse(product.customFields) : null
    }

    return NextResponse.json({ success: true, data: formattedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updateData = await request.json()

    // Check if product exists and belongs to user's company
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // If code is being updated, check for duplicates
    if (updateData.code && updateData.code !== existingProduct.code) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          code: updateData.code,
          id: { not: params.id }
        }
      })

      if (duplicateProduct) {
        return NextResponse.json({ 
          success: false, 
          error: 'Product code already exists' 
        }, { status: 400 })
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...updateData,
        dimensions: updateData.dimensions ? JSON.stringify(updateData.dimensions) : undefined,
        images: updateData.images ? JSON.stringify(updateData.images) : undefined,
        tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
        customFields: updateData.customFields ? JSON.stringify(updateData.customFields) : undefined,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    })

    // Parse JSON fields for response
    const formattedProduct = {
      ...product,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      customFields: product.customFields ? JSON.parse(product.customFields) : null
    }

    return NextResponse.json({ success: true, data: formattedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if product exists and belongs to user's company
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}







