import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

// GET - Récupérer le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = currentUser.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        jobTitle: true,
        phone: true,
        timezone: true,
        gender: true,
        age: true,
        highestDegree: true,
        mainGoal: true,
        hasCoach: true,
        employeeCount: true,
        userType: true,
        role: true,
        plan: true,
        billingCycle: true,
        createdAt: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      company,
      jobTitle,
      phone,
      timezone,
      gender,
      age,
      highestDegree,
      mainGoal,
      hasCoach,
      employeeCount,
    } = body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(company !== undefined && { company }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(phone !== undefined && { phone }),
        ...(timezone !== undefined && { timezone }),
        ...(gender !== undefined && { gender }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(highestDegree !== undefined && { highestDegree }),
        ...(mainGoal !== undefined && { mainGoal }),
        ...(hasCoach !== undefined && { hasCoach: hasCoach === 'Yes' || hasCoach === true }),
        ...(employeeCount !== undefined && { employeeCount }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        jobTitle: true,
        phone: true,
        timezone: true,
        gender: true,
        age: true,
        highestDegree: true,
        mainGoal: true,
        hasCoach: true,
        employeeCount: true,
        userType: true,
        role: true,
        plan: true,
        billingCycle: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer le compte utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const userId = user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
