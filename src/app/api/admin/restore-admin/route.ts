import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Restore admin permissions for clement@clementroy.work
// This is a temporary emergency endpoint
export async function POST(request: NextRequest) {
  try {
    // Simple security check - you can add a secret token if needed
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-restore-secret');
    
    // For security, you should set RESTORE_ADMIN_SECRET in your environment
    const expectedSecret = process.env.RESTORE_ADMIN_SECRET || 'temporary-restore-secret-change-me';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Secret required.' },
        { status: 401 }
      );
    }

    const adminEmail = 'clement@clementroy.work';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          email: adminEmail
        },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json({
        success: true,
        message: 'User is already an admin',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      });
    }

    // Update to admin
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        role: 'admin',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin permissions restored successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error restoring admin:', error);
    return NextResponse.json(
      { error: 'Failed to restore admin permissions' },
      { status: 500 }
    );
  }
}

// GET - Check current status
export async function GET(request: NextRequest) {
  try {
    const adminEmail = 'clement@clementroy.work';
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          email: adminEmail
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}

