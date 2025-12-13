import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

// GET - Get user details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Fetch user details
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
        role: true,
        roles: true,
        userType: true,
        plan: true,
        billingCycle: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse roles array
    const roles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as string))
      : [user.role];

    return NextResponse.json({ 
      user: {
        ...user,
        roles
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

