import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await db.user.findByUsername(username)

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Hesap devre dışı' },
        { status: 401 }
      )
    }

    // Verify hashed password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Hatalı şifre' },
        { status: 401 }
      )
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Giriş başarılı'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}