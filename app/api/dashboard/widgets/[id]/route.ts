import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

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

    const updates = await request.json()
    const updateData: any = { updatedAt: new Date() }

    // Handle JSON fields
    if (updates.position) {
      updateData.position = JSON.stringify(updates.position)
    }
    if (updates.size) {
      updateData.size = JSON.stringify(updates.size)
    }
    if (updates.config) {
      updateData.config = JSON.stringify(updates.config)
    }

    // Handle other fields
    const allowedFields = ['title', 'description', 'dataSource', 'refreshRate', 'isVisible', 'isCollapsed', 'order']
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    })

    const widget = await prisma.dashboardWidget.update({
      where: {
        id: params.id,
        userId // Ensure user can only update their own widgets
      },
      data: updateData
    })

    // Parse JSON fields for response
    const responseWidget = {
      ...widget,
      position: JSON.parse(widget.position),
      size: JSON.parse(widget.size),
      config: JSON.parse(widget.config)
    }

    return NextResponse.json({ success: true, widget: responseWidget })
  } catch (error) {
    console.error('Error updating widget:', error)
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

    await prisma.dashboardWidget.delete({
      where: {
        id: params.id,
        userId // Ensure user can only delete their own widgets
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}







