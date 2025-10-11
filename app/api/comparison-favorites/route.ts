import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Kullanıcının favori karşılaştırmalarını getir
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const favorites = await prisma.comparisonFavorite.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: favorites
    });
  } catch (error: any) {
    console.error('Error fetching comparison favorites:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni favori karşılaştırma kaydet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      userId,
      period1Start,
      period1End,
      period2Start,
      period2End,
      selectedFirms,
      isDefault
    } = body;

    if (!name || !userId || !period1Start || !period1End || !period2Start || !period2End) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Eğer bu default olarak işaretlendiyse, diğer defaultları kaldır
    if (isDefault) {
      await prisma.comparisonFavorite.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const favorite = await prisma.comparisonFavorite.create({
      data: {
        name,
        description,
        userId,
        period1Start,
        period1End,
        period2Start,
        period2End,
        selectedFirms: selectedFirms ? JSON.stringify(selectedFirms) : null,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Favori karşılaştırma kaydedildi'
    });
  } catch (error: any) {
    console.error('Error creating comparison favorite:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Favori karşılaştırma sil
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Favorite ID is required' },
        { status: 400 }
      );
    }

    await prisma.comparisonFavorite.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Favori karşılaştırma silindi'
    });
  } catch (error: any) {
    console.error('Error deleting comparison favorite:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}



