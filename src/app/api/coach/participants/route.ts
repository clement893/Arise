import { NextRequest, NextResponse } from 'next/server';
import { requireCoach } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isParticipant } from '@/lib/roles-helper';

/**
 * Get list of participants for coach
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // all, with_coach, without_coach
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause - filter at DB level
    const where: any = {
      isActive: true,
      role: 'participant', // Filter at DB level
    };

    // Add search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add coach filter
    if (filter === 'with_coach') {
      where.hasCoach = true;
    } else if (filter === 'without_coach') {
      where.hasCoach = false;
    }

    // Use Promise.all for parallel queries
    const [allUsers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          plan: true,
          createdAt: true,
          hasCoach: true,
          roles: true,
          _count: {
            select: {
              assessments: true,
            }
          },
          assessments: {
            select: {
              id: true,
              assessmentType: true,
              completedAt: true,
              overallScore: true,
            },
            take: 10, // Limit assessments per user
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    // Filter to only participants (check roles array for admin/coach)
    const participants = allUsers.filter(user => 
      isParticipant(user.roles, user.role || 'participant')
    );

    // Add computed fields (optimized single-pass calculation)
    const participantsWithStats = participants.map(participant => {
      const assessments = participant.assessments || [];
      let completedCount = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      // Single pass through assessments
      for (const assessment of assessments) {
        if (assessment.completedAt !== null) {
          completedCount++;
        }
        if (assessment.overallScore !== null) {
          totalScore += assessment.overallScore;
          scoreCount++;
        }
      }

      return {
        ...participant,
        assessmentCount: assessments.length,
        completedAssessments: completedCount,
        averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      };
    });

    return NextResponse.json({
      participants: participantsWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

