import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Map frontend types to database types
    const typeMap: Record<string, string> = {
      'tki': 'tki',
      'wellness': 'wellness',
      '360-self': '360-self',
      'self_360': '360-self',
    };
    
    const dbType = typeMap[type] || type;
    
    const questions = await prisma.assessmentQuestion.findMany({
      where: { assessmentType: dbType },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
