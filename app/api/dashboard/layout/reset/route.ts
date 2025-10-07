import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

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

    // Delete all user's widgets
    await prisma.dashboardWidget.deleteMany({
      where: { userId }
    })

    // Reset layout to default
    const defaultLayout = await prisma.dashboardLayout.upsert({
      where: { userId },
      update: {
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
        }),
        updatedAt: new Date()
      },
      create: {
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

    return NextResponse.json({ success: true, message: 'Layout sıfırlandı' })
  } catch (error) {
    console.error('Error resetting layout:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}













