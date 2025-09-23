import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({ companies }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { error: 'Firmalar getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const company = await prisma.company.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        taxNumber: data.taxNumber,
        isActive: true
      }
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('Company creation error:', error)
    return NextResponse.json(
      { error: 'Firma oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

