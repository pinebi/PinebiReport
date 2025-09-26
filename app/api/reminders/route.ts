import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Hatırlatmaları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');
    const assignedToId = searchParams.get('assignedToId');
    const isCompleted = searchParams.get('isCompleted');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const whereClause: any = {
      companyId,
    };

    // Kullanıcıya atanmış hatırlatmaları veya kullanıcının oluşturduğu hatırlatmaları getir
    if (userId) {
      whereClause.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    // Belirli bir kullanıcıya atanmış hatırlatmaları getir
    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }

    // Tamamlanma durumu filtresi
    if (isCompleted !== null && isCompleted !== undefined) {
      whereClause.isCompleted = isCompleted === 'true';
    }

    // Öncelik filtresi
    if (priority) {
      whereClause.priority = priority;
    }

    // Kategori filtresi
    if (category) {
      whereClause.category = category;
    }

    const reminders = await prisma.reminder.findMany({
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
        calendarEvent: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: [
        { reminderDate: 'asc' },
        { priority: 'desc' }
      ]
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Reminders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni hatırlatma oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      reminderDate,
      companyId,
      createdById,
      assignedToId,
      calendarEventId,
      priority,
      category,
      tags,
      isRecurring,
      recurrence
    } = body;

    if (!title || !reminderDate || !companyId || !createdById) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        reminderDate: new Date(reminderDate),
        companyId,
        createdById,
        assignedToId: assignedToId || null,
        calendarEventId: calendarEventId || null,
        priority: priority || 'MEDIUM',
        category,
        tags: tags ? JSON.stringify(tags) : null,
        isRecurring: isRecurring || false,
        recurrence: recurrence ? JSON.stringify(recurrence) : null
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
        },
        calendarEvent: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Reminders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
