import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Belirli bir hatırlatmayı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: params.id },
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
            endDate: true,
            description: true
          }
        }
      }
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Reminder GET by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Hatırlatmayı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      reminderDate,
      assignedToId,
      isCompleted,
      priority,
      category,
      tags,
      isRecurring,
      recurrence
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (reminderDate !== undefined) updateData.reminderDate = new Date(reminderDate);
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrence !== undefined) updateData.recurrence = recurrence ? JSON.stringify(recurrence) : null;

    const reminder = await prisma.reminder.update({
      where: { id: params.id },
      data: updateData,
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
            endDate: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Reminder PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Hatırlatmayı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reminder.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Reminder DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
