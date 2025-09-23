import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const gridType = searchParams.get('gridType')
    
    if (!userId || !gridType) {
      return NextResponse.json({ error: 'userId and gridType are required' }, { status: 400 })
    }

    const settings = await db.userGridSettings.findByUserAndGrid(userId, gridType)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching user grid settings:', error)
    return NextResponse.json({ error: 'Failed to fetch grid settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, gridType, columnSettings, filterSettings, sortSettings, groupSettings, pivotSettings, sidebarSettings, viewPreferences } = data
    
    console.log('Grid settings save request:', { userId, gridType })
    
    if (!userId || !gridType) {
      console.log('Missing required fields:', { userId, gridType })
      return NextResponse.json({ error: 'userId and gridType are required' }, { status: 400 })
    }

    // Check if user exists
    const userExists = await db.user.findById(userId)

    if (!userExists) {
      console.log('User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare settings data
    const settingsData = {
      columnSettings: columnSettings ? JSON.stringify(columnSettings) : null,
      filterSettings: filterSettings ? JSON.stringify(filterSettings) : null,
      sortSettings: sortSettings ? JSON.stringify(sortSettings) : null,
      groupSettings: groupSettings ? JSON.stringify(groupSettings) : null,
      pivotSettings: pivotSettings ? JSON.stringify(pivotSettings) : null,
      sidebarSettings: sidebarSettings ? JSON.stringify(sidebarSettings) : null,
      viewPreferences: viewPreferences ? JSON.stringify(viewPreferences) : null
    }

    // Upsert (update or create) user grid settings
    const settings = await db.userGridSettings.upsert(userId, gridType, settingsData)

    console.log('Grid settings saved successfully for user:', userId, 'grid:', gridType)
    return NextResponse.json({ 
      settings,
      message: 'Grid ayarları başarıyla kaydedildi!',
      success: true
    })
  } catch (error) {
    console.error('Error saving user grid settings:', error)
    return NextResponse.json({ error: 'Failed to save grid settings' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const gridType = searchParams.get('gridType')
    
    if (!userId || !gridType) {
      return NextResponse.json({ error: 'userId and gridType are required' }, { status: 400 })
    }

    await db.userGridSettings.delete(userId, gridType)

    return NextResponse.json({ message: 'Grid settings deleted successfully' })
  } catch (error) {
    console.error('Error deleting user grid settings:', error)
    return NextResponse.json({ error: 'Failed to delete grid settings' }, { status: 500 })
  }
}
