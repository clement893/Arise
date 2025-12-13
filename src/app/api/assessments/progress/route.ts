import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

/**
 * Assessment Progress API
 * 
 * Handles saving and retrieving in-progress assessments
 * so users can continue tests they started but didn't finish.
 */

// GET - Retrieve progress for a specific assessment or all in-progress assessments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;
    const assessmentType = request.nextUrl.searchParams.get('type');

    // If specific type requested, get that progress
    if (assessmentType) {
      const progress = await prisma.assessmentProgress.findUnique({
        where: {
          userId_assessmentType: {
            userId: userId,
            assessmentType: assessmentType as any,
          },
        },
      });

      return NextResponse.json({ progress });
    }

    // Otherwise, get all in-progress assessments for the user
    const allProgress = await prisma.assessmentProgress.findMany({
      where: { userId: userId },
      orderBy: { lastUpdatedAt: 'desc' },
    });

    return NextResponse.json({ progress: allProgress });
  } catch (error) {
    console.error('Get assessment progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get assessment progress' },
      { status: 500 }
    );
  }
}

// POST - Save or update progress for an assessment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;

    const body = await request.json();
    const { assessmentType, currentQuestion, answers, totalQuestions } = body;

    if (!assessmentType) {
      return NextResponse.json(
        { error: 'Assessment type is required' },
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

    // Upsert - create or update progress
    const progress = await prisma.assessmentProgress.upsert({
      where: {
        userId_assessmentType: {
          userId: userId,
          assessmentType: assessmentType,
        },
      },
      update: {
        currentQuestion: currentQuestion ?? 0,
        answers: answers ?? {},
        totalQuestions: totalQuestions ?? 30,
      },
      create: {
        userId: userId,
        assessmentType,
        currentQuestion: currentQuestion ?? 0,
        answers: answers ?? {},
        totalQuestions: totalQuestions ?? 30,
      },
    });

    return NextResponse.json({
      message: 'Progress saved successfully',
      progress,
    });
  } catch (error) {
    console.error('Save assessment progress error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment progress' },
      { status: 500 }
    );
  }
}

// DELETE - Remove progress when assessment is completed
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;
    const assessmentType = request.nextUrl.searchParams.get('type');

    if (!assessmentType) {
      return NextResponse.json(
        { error: 'Assessment type is required' },
        { status: 400 }
      );
    }

    // Delete the progress record
    await prisma.assessmentProgress.delete({
      where: {
        userId_assessmentType: {
          userId: userId,
          assessmentType: assessmentType as any,
        },
      },
    }).catch(() => {
      // Ignore if not found
    });

    return NextResponse.json({
      message: 'Progress deleted successfully',
    });
  } catch (error) {
    console.error('Delete assessment progress error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment progress' },
      { status: 500 }
    );
  }
}
