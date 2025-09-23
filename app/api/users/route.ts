import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await db.user.findAll()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Convert role to enum format
    const roleMap: { [key: string]: string } = {
      'admin': 'ADMIN',
      'user': 'USER',
      'viewer': 'VIEWER',
      'reporter': 'REPORTER'
    }
    
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash('defaultpass', 10)

    const user = await db.user.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      companyId: data.companyId,
      role: roleMap[data.role] || 'USER',
      isActive: data.isActive !== undefined ? data.isActive : true
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}


