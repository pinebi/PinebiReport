import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await db.user.findById(params.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const updateData: any = {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      companyId: data.companyId,
      role: data.role,
      isActive: data.isActive
    }

    // If password is provided, hash it
    if (data.password && data.password !== 'defaultpass') {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const user = await db.user.update(params.id, updateData)
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.user.delete(params.id)
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}