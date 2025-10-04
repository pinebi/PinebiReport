import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { ThemeConfig } from '@/contexts/ThemeContext'

export async function GET(request: NextRequest) {
  try {
    // Get user from Authorization header or session
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Decode token to get user ID (simple base64 decode for now)
    let userId: string
    try {
      const decoded = Buffer.from(token, 'base64').toString()
      userId = decoded.split(':')[0]
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    // Get user theme from database
    const userTheme = await prisma.userTheme.findUnique({
      where: { userId }
    })

    if (!userTheme) {
      // Create default theme for user
      const defaultTheme = await prisma.userTheme.create({
        data: {
          userId,
          themeName: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          sidebarColor: '#f8fafc',
          borderRadius: '0.5rem',
          fontSize: '14px',
          fontFamily: 'Inter',
          darkMode: false
        }
      })

      return NextResponse.json({
        success: true,
        theme: defaultTheme
      })
    }

    return NextResponse.json({
      success: true,
      theme: userTheme
    })

  } catch (error) {
    console.error('Error fetching user theme:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const themeData: ThemeConfig = await request.json()

    // Get user from Authorization header or session
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Decode token to get user ID
    let userId: string
    try {
      const decoded = Buffer.from(token, 'base64').toString()
      userId = decoded.split(':')[0]
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    // Validate theme data
    const requiredFields = [
      'themeName', 'primaryColor', 'secondaryColor', 'accentColor',
      'backgroundColor', 'textColor', 'sidebarColor', 'borderRadius',
      'fontSize', 'fontFamily', 'darkMode'
    ]

    for (const field of requiredFields) {
      if (!(field in themeData)) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 })
      }
    }

    // Upsert user theme
    const userTheme = await prisma.userTheme.upsert({
      where: { userId },
      update: {
        themeName: themeData.themeName,
        primaryColor: themeData.primaryColor,
        secondaryColor: themeData.secondaryColor,
        accentColor: themeData.accentColor,
        backgroundColor: themeData.backgroundColor,
        textColor: themeData.textColor,
        sidebarColor: themeData.sidebarColor,
        borderRadius: themeData.borderRadius,
        fontSize: themeData.fontSize,
        fontFamily: themeData.fontFamily,
        darkMode: themeData.darkMode,
        customCSS: themeData.customCSS || null,
        updatedAt: new Date()
      },
      create: {
        userId,
        themeName: themeData.themeName,
        primaryColor: themeData.primaryColor,
        secondaryColor: themeData.secondaryColor,
        accentColor: themeData.accentColor,
        backgroundColor: themeData.backgroundColor,
        textColor: themeData.textColor,
        sidebarColor: themeData.sidebarColor,
        borderRadius: themeData.borderRadius,
        fontSize: themeData.fontSize,
        fontFamily: themeData.fontFamily,
        darkMode: themeData.darkMode,
        customCSS: themeData.customCSS || null
      }
    })

    return NextResponse.json({
      success: true,
      theme: userTheme,
      message: 'Tema başarıyla kaydedildi'
    })

  } catch (error) {
    console.error('Error saving user theme:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from Authorization header or session
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Decode token to get user ID
    let userId: string
    try {
      const decoded = Buffer.from(token, 'base64').toString()
      userId = decoded.split(':')[0]
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    // Delete user theme (will reset to default)
    await prisma.userTheme.delete({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Tema sıfırlandı'
    })

  } catch (error) {
    console.error('Error deleting user theme:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error'
    }, { status: 500 })
  }
}







