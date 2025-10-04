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

    let layout = await prisma.dashboardLayout.findUnique({
      where: { userId }
    })

    // Create default layout if none exists
    if (!layout) {
      layout = await prisma.dashboardLayout.create({
        data: {
          userId,
          name: 'Default Layout',
          isDefault: true,
          layout: JSON.stringify({
            columns: 12,
            rowHeight: 60,
            margin: [16, 16],
            containerPadding: [16, 16]
          }),
          widgets: JSON.stringify([]),
          gridSize: '12',
          breakpoints: JSON.stringify({
            lg: 1200,
            md: 996,
            sm: 768,
            xs: 480
          })
        }
      })
    }

    // Parse JSON fields for response
    const responseLayout = {
      ...layout,
      layout: JSON.parse(layout.layout),
      widgets: JSON.parse(layout.widgets),
      breakpoints: layout.breakpoints ? JSON.parse(layout.breakpoints) : null
    }

    return NextResponse.json({ success: true, layout: responseLayout })
  } catch (error) {
    console.error('Error fetching layout:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { layout: layoutData, widgets: widgetsData } = await request.json()

    const updatedLayout = await prisma.dashboardLayout.upsert({
      where: { userId },
      update: {
        layout: JSON.stringify(layoutData),
        widgets: JSON.stringify(widgetsData),
        updatedAt: new Date()
      },
      create: {
        userId,
        name: 'Default Layout',
        isDefault: true,
        layout: JSON.stringify(layoutData),
        widgets: JSON.stringify(widgetsData),
        gridSize: '12',
        breakpoints: JSON.stringify({
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480
        })
      }
    })

    // Parse JSON fields for response
    const responseLayout = {
      ...updatedLayout,
      layout: JSON.parse(updatedLayout.layout),
      widgets: JSON.parse(updatedLayout.widgets),
      breakpoints: updatedLayout.breakpoints ? JSON.parse(updatedLayout.breakpoints) : null
    }

    return NextResponse.json({ success: true, layout: responseLayout })
  } catch (error) {
    console.error('Error updating layout:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}







