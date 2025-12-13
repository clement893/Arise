import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST - Create a new user (coach or participant)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role = 'coach', userType = 'coach', plan = 'coach' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role === 'coach' ? 'coach' : 'participant',
        userType: userType === 'coach' ? 'coach' : 'individual',
        plan: plan || 'coach',
        isActive: true,
        emailVerified: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'User created successfully',
      user
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { userId, action, userType, plan, roles } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    // Prevent admin from removing their own admin role
    if (userId === adminUser.id && (action === 'make_participant' || action === 'remove_admin')) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin permissions' },
        { status: 400 }
      );
    }

    // Get current user to manage roles array
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true, role: true }
    });

    let currentRoles: string[] = [];
    if (currentUser?.roles) {
      currentRoles = Array.isArray(currentUser.roles) 
        ? currentUser.roles 
        : JSON.parse(currentUser.roles as string);
    } else if (currentUser?.role) {
      currentRoles = [currentUser.role];
    }

    switch (action) {
      case 'make_admin':
        if (!currentRoles.includes('admin')) {
          currentRoles.push('admin');
        }
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: 'admin' as const, // Keep legacy field
            roles: currentRoles
          }
        });
        break;

      case 'remove_admin':
        currentRoles = currentRoles.filter(r => r !== 'admin');
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: (currentRoles[0] || 'participant') as 'admin' | 'coach' | 'participant', // Fallback to first role
            roles: currentRoles
          }
        });
        break;

      case 'make_participant':
        if (!currentRoles.includes('participant')) {
          currentRoles.push('participant');
        }
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: (currentRoles.includes('admin') ? 'admin' : 'participant') as 'admin' | 'coach' | 'participant',
            roles: currentRoles
          }
        });
        break;

      case 'remove_participant':
        currentRoles = currentRoles.filter(r => r !== 'participant');
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: (currentRoles[0] || 'participant') as 'admin' | 'coach' | 'participant',
            roles: currentRoles
          }
        });
        break;

      case 'make_coach':
        if (!currentRoles.includes('coach')) {
          currentRoles.push('coach');
        }
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: (currentRoles.includes('admin') ? 'admin' : 'coach') as 'admin' | 'coach' | 'participant',
            roles: currentRoles,
            userType: userType || 'coach',
            plan: plan || 'coach'
          }
        });
        break;

      case 'remove_coach':
        currentRoles = currentRoles.filter(r => r !== 'coach');
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: (currentRoles[0] || 'participant') as 'admin' | 'coach' | 'participant',
            roles: currentRoles
          }
        });
        break;

      case 'set_roles':
        // Set roles directly from array
        if (roles && Array.isArray(roles)) {
          const primaryRole = roles.includes('admin') 
            ? 'admin' 
            : (roles[0] || 'participant') as 'admin' | 'coach' | 'participant';
          await prisma.user.update({
            where: { id: userId },
            data: { 
              role: primaryRole,
              roles: roles,
              userType: userType || undefined,
              plan: plan || undefined
            }
          });
        } else {
          return NextResponse.json(
            { error: 'Invalid roles array' },
            { status: 400 }
          );
        }
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
