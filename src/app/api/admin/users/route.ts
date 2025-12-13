import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own role
    if (userId === adminUser.id && (action === 'make_participant' || action === 'delete')) {
      return NextResponse.json(
        { error: 'Cannot modify your own admin account' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'make_admin':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'admin' }
        });
        break;

      case 'make_participant':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'participant' }
        });
        break;

      case 'make_coach':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'coach' }
        });
        break;

      case 'delete':
        // Delete related data first
        await prisma.assessmentResult.deleteMany({ where: { userId } });
        await prisma.evaluator.deleteMany({ where: { userId } });
        await prisma.subscription.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        break;

      case 'view':
      case 'edit':
        // These actions are handled on the frontend
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user with password confirmation
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'Missing userId or password' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting their own account
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    // Verify admin password
    const admin = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: { password: true }
    });

    if (!admin || !admin.password) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Verify user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete related data first
    await prisma.assessmentResult.deleteMany({ where: { userId } });
    await prisma.assessmentProgress.deleteMany({ where: { userId } });
    await prisma.evaluator.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    
    // Delete the user
    await prisma.user.delete({ where: { id: userId } });

    console.log(`User ${userId} deleted by admin ${adminUser.id}`);

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
