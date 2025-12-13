import { NextRequest, NextResponse } from 'next/server';
import { requireCoach } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isParticipant } from '@/lib/roles-helper';

/**
 * Get coach dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const coach = await requireCoach(request);
    if (!coach) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Optimized: Use Prisma aggregation and filtering
    // First, get participant count efficiently
    const [participantsData, assessmentResults, totalParticipantsCount] = await Promise.all([
      // Get participants with minimal data
      prisma.user.findMany({
        where: {
          isActive: true,
          role: 'participant', // Filter at DB level first
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          plan: true,
          createdAt: true,
          hasCoach: true,
          role: true,
          roles: true,
        },
        take: 10, // Only get first 10 for preview
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Get all assessment results in parallel
      prisma.assessmentResult.findMany({
        where: {
          user: {
            isActive: true,
            role: 'participant',
          }
        },
        select: {
          id: true,
          userId: true,
          assessmentType: true,
          completedAt: true,
          overallScore: true,
        }
      }),
      // Count total participants
      prisma.user.count({
        where: {
          isActive: true,
          role: 'participant',
        }
      })
    ]);

    // Filter participants that don't have admin/coach in roles array
    const participants = participantsData.filter(user => 
      isParticipant(user.roles, user.role || 'participant')
    );

    // Calculate statistics efficiently with parallel queries
    const participantsWithCoachCount = await prisma.user.count({
      where: {
        isActive: true,
        role: 'participant',
        hasCoach: true,
      }
    });

    // Single pass through assessmentResults for all calculations
    const assessmentsByType: Record<string, number> = {};
    let completedAssessments = 0;
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const result of assessmentResults) {
      assessmentsByType[result.assessmentType] = (assessmentsByType[result.assessmentType] || 0) + 1;
      if (result.completedAt !== null) {
        completedAssessments++;
      }
      if (result.overallScore !== null) {
        totalScore += result.overallScore;
        scoreCount++;
      }
    }

    const totalAssessments = assessmentResults.length;
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return NextResponse.json({
      stats: {
        totalParticipants: totalParticipantsCount,
        participantsWithCoach: participantsWithCoachCount,
        totalAssessments,
        completedAssessments,
        averageScore,
        assessmentsByType,
      },
      participants, // Already limited to 10
    });
  } catch (error) {
    console.error('Error fetching coach stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach statistics' },
      { status: 500 }
    );
  }
}

