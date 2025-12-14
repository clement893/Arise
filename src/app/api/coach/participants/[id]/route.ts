import { NextRequest, NextResponse } from 'next/server';
import { requireCoach } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get participant details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coach = await requireCoach(request);
    if (!coach) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const participantId = parseInt(id);

    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    // Get participant
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        createdAt: true,
        hasCoach: true,
        assessments: {
          orderBy: {
            completedAt: 'desc'
          },
          select: {
            id: true,
            assessmentType: true,
            answers: true,
            scores: true,
            dominantResult: true,
            overallScore: true,
            completedAt: true,
            createdAt: true,
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      participant,
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participant' },
      { status: 500 }
    );
  }
}

/**
 * Update participant (e.g., assign/unassign coach)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coach = await requireCoach(request);
    if (!coach) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const participantId = parseInt(id);

    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: 'Invalid participant ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hasCoach } = body;

    // Update participant
    const updated = await prisma.user.update({
      where: { id: participantId },
      data: {
        hasCoach: hasCoach !== undefined ? hasCoach : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        hasCoach: true,
      }
    });

    return NextResponse.json({
      participant: updated,
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

