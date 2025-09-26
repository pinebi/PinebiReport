import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Takvim etkinliklerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const assignedToId = searchParams.get('assignedToId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const whereClause: any = {
      companyId,
    };

    // Kullanıcıya atanmış etkinlikleri veya kullanıcının oluşturduğu etkinlikleri getir
    if (userId) {
      whereClause.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    // Belirli bir kullanıcıya atanmış etkinlikleri getir
    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }

    // Tarih aralığı filtresi
    if (startDate && endDate) {
      whereClause.OR = [
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        {
          AND: [
            { startDate: { lte: new Date(startDate) } },
            { endDate: { gte: new Date(startDate) } }
          ]
        }
      ];
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        reminders: {
          select: {
            id: true,
            title: true,
            reminderDate: true,
            isCompleted: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni takvim etkinliği oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      color,
      isRecurring,
      recurrence,
      companyId,
      createdById,
      assignedToId,
      priority,
      category,
      tags
    } = body;

    if (!title || !startDate || !companyId || !createdById) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay || false,
        location,
        color: color || '#3b82f6',
        isRecurring: isRecurring || false,
        recurrence: recurrence ? JSON.stringify(recurrence) : null,
        companyId,
        createdById,
        assignedToId: assignedToId || null,
        priority: priority || 'MEDIUM',
        category,
        tags: tags ? JSON.stringify(tags) : null
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
