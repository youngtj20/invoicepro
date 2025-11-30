import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/plans - Get all active plans
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
