import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Belirli bir firmadaki kullanıcıları getir (atama için)
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: params.companyId,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET by company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
