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

    const widgets = await prisma.dashboardWidget.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, widgets })
  } catch (error) {
    console.error('Error fetching widgets:', error)
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

    const widgetData = await request.json()

    const widget = await prisma.dashboardWidget.create({
      data: {
        userId,
        widgetType: widgetData.widgetType,
        title: widgetData.title,
        description: widgetData.description,
        position: JSON.stringify(widgetData.position),
        size: JSON.stringify(widgetData.size),
        config: JSON.stringify(widgetData.config),
        dataSource: widgetData.dataSource,
        refreshRate: widgetData.refreshRate || 300000,
        isVisible: widgetData.isVisible !== false,
        isCollapsed: widgetData.isCollapsed || false,
        order: widgetData.order || 0
      }
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
    console.error('Error creating widget:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}







