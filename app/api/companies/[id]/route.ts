import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await db.company.findById(params.id)
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    return NextResponse.json({ company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const company = await db.company.update(params.id, {
      name: data.name,
      code: data.code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      taxNumber: data.taxNumber,
      isActive: data.isActive
    })
    
    return NextResponse.json({ company })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.company.delete(params.id)
    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}