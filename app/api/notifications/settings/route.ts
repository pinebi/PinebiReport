import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    
    console.log('📧 Notification settings received:', settings)
    
    // Burada ayarları database'e kaydedebilirsiniz
    // await prisma.notificationSettings.upsert({...})
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bildirim ayarları kaydedildi' 
    })
  } catch (error: any) {
    console.error('❌ Notification settings error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Mock settings
    const settings = {
      email: {
        enabled: true,
        address: 'user@example.com',
        timing: ['60', '1440']
      },
      whatsapp: {
        enabled: false,
        phone: '',
        timing: ['15', '60']
      },
      sms: {
        enabled: false,
        phone: '',
        timing: ['30']
      },
      push: {
        enabled: true,
        timing: ['5', '15']
      },
      defaultTiming: '15'
    }
    
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('❌ Get notification settings error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}



