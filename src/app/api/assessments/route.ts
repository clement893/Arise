import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

// GET - Récupérer tous les résultats d'assessments d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token (middleware adds x-user-id header)
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;
    const assessmentType = request.nextUrl.searchParams.get('type');

    const whereClause: any = { userId: userId };
    if (assessmentType) {
      whereClause.assessmentType = assessmentType;
    }

    const assessments = await prisma.assessmentResult.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
    });

    // Calculate summary for dashboard
    const summary = {
      tki: assessments.find(a => a.assessmentType === 'tki'),
      wellness: assessments.find(a => a.assessmentType === 'wellness'),
      self_360: assessments.find(a => a.assessmentType === 'self_360'),
      mbti: assessments.find(a => a.assessmentType === 'mbti'),
      completedCount: assessments.length,
      totalAssessments: 4,
      overallProgress: Math.round((assessments.length / 4) * 100),
    };

    return NextResponse.json({ assessments, summary });
  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to get assessments' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder un résultat d'assessment
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token (middleware adds x-user-id header)
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;

    const body = await request.json();
    const { assessmentType, answers, scores, dominantResult, overallScore } = body;

    if (!assessmentType || !answers || !scores) {
      return NextResponse.json(
        { error: 'Assessment type, answers, and scores are required' },
        { status: 400 }
      );
    }

    // Validate assessment type
    const validTypes = ['tki', 'wellness', 'self_360', 'mbti'];
    if (!validTypes.includes(assessmentType)) {
      return NextResponse.json(
        { error: 'Invalid assessment type' },
        { status: 400 }
      );
    }

    // Upsert - create or update if exists
    const assessment = await prisma.assessmentResult.upsert({
      where: {
        userId_assessmentType: {
          userId: userId,
          assessmentType: assessmentType,
        },
      },
      update: {
        answers,
        scores,
        dominantResult,
        overallScore,
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        assessmentType,
        answers,
        scores,
        dominantResult,
        overallScore,
      },
    });

    return NextResponse.json({
      message: 'Assessment saved successfully',
      assessment,
    });
  } catch (error) {
    console.error('Save assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}
