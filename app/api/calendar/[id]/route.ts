import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Belirli bir takvim etkinliğini getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.calendarEvent.findUnique({
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
        reminders: {
          select: {
            id: true,
            title: true,
            reminderDate: true,
            isCompleted: true,
            priority: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Calendar GET by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Takvim etkinliğini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      assignedToId,
      isCompleted,
      priority,
      category,
      tags
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (allDay !== undefined) updateData.allDay = allDay;
    if (location !== undefined) updateData.location = location;
    if (color !== undefined) updateData.color = color;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrence !== undefined) updateData.recurrence = recurrence ? JSON.stringify(recurrence) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;

    const event = await prisma.calendarEvent.update({
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
        reminders: {
          select: {
            id: true,
            title: true,
            reminderDate: true,
            isCompleted: true,
            priority: true
          }
        }
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Takvim etkinliğini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.calendarEvent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
