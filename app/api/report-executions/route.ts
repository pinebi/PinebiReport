import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const executions = await db.reportExecution.findAll()
    return NextResponse.json({ executions })
  } catch (error) {
    console.error('Report executions fetch error:', error)
    return NextResponse.json(
      { error: 'Rapor çalıştırma geçmişi getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const execution = await db.reportExecution.create({
      reportId: data.reportId,
      userId: data.userId,
      status: 'RUNNING',
      parameters: data.parameters || {}
    })

    // Simulate report execution
    setTimeout(async () => {
      try {
        // Mock successful execution
        const mockData = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          date: new Date(2024, 2, Math.floor(Math.random() * 30) + 1).toLocaleDateString('tr-TR'),
          product: `Ürün ${i + 1}`,
          quantity: Math.floor(Math.random() * 100) + 1,
          amount: (Math.random() * 10000).toFixed(2),
          customer: `Müşteri ${Math.floor(Math.random() * 20) + 1}`
        }))

        await db.reportExecution.update(execution.id, {
          status: 'COMPLETED',
          endTime: new Date(),
          duration: 3000,
          recordCount: mockData.length,
          resultData: mockData
        })
      } catch (error) {
        await db.reportExecution.update(execution.id, {
          status: 'FAILED',
          endTime: new Date(),
          duration: 3000,
          errorMessage: 'API bağlantı hatası'
        })
      }
    }, 3000)

    return NextResponse.json({ execution }, { status: 201 })
  } catch (error) {
    console.error('Report execution creation error:', error)
    return NextResponse.json(
      { error: 'Rapor çalıştırılırken hata oluştu' },
      { status: 500 }
    )
  }
}


