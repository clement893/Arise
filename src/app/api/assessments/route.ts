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
      select: {
        id: true,
        userId: true,
        assessmentType: true,
        answers: true,
        scores: true,
        dominantResult: true,
        overallScore: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    // Calculate summary for dashboard
    const summary = {
      tki: assessments.find(a => a.assessmentType === 'tki') || null,
      wellness: assessments.find(a => a.assessmentType === 'wellness') || null,
      self_360: assessments.find(a => a.assessmentType === 'self_360') || null,
      mbti: assessments.find(a => a.assessmentType === 'mbti') || null,
      completedCount: assessments.length,
      totalAssessments: 4,
      overallProgress: Math.round((assessments.length / 4) * 100),
    };

    console.log('GET /api/assessments - User:', userId, 'Found assessments:', assessments.length);
    console.log('GET /api/assessments - TKI assessment:', assessments.find(a => a.assessmentType === 'tki'));
    console.log('GET /api/assessments - MBTI assessment:', assessments.find(a => a.assessmentType === 'mbti'));
    console.log('GET /api/assessments - Summary TKI:', summary.tki);
    console.log('GET /api/assessments - Summary MBTI:', summary.mbti);
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

    console.log('POST /api/assessments - Saved assessment:', {
      userId,
      assessmentType,
      dominantResult,
      overallScore,
      assessmentId: assessment.id,
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
