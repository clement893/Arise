import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      email,
      password,
      firstName,
      lastName,
      company,
      jobTitle,
      phone,
      timezone,
      userType,
      plan,
      billingCycle
    } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      // Check if it's a "table does not exist" error
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes('does not exist') || errorMessage.includes('P2021')) {
        return NextResponse.json(
          { error: 'Database tables not initialized. Please contact support.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Map userType to enum value
    const validUserTypes = ['individual', 'coach', 'business'] as const;
    const mappedUserType = validUserTypes.includes(userType) ? userType : 'individual';

    // Map plan to enum value
    const validPlans = ['starter', 'professional', 'enterprise'] as const;
    const mappedPlan = validPlans.includes(plan) ? plan : 'starter';

    // Map billingCycle to enum value
    const validBillingCycles = ['monthly', 'annual'] as const;
    const mappedBillingCycle = validBillingCycles.includes(billingCycle) ? billingCycle : 'monthly';

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        company: company || null,
        jobTitle: jobTitle || null,
        phone: phone || null,
        timezone: timezone || null,
        userType: mappedUserType,
        plan: mappedPlan,
        billingCycle: mappedBillingCycle,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        plan: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' },
          { status: 503 }
        );
      }
      if (error.message.includes('does not exist') || error.message.includes('P2021')) {
        return NextResponse.json(
          { error: 'Database tables not initialized. Please contact support.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'An error occurred while creating your account. Please try again.' },
      { status: 500 }
    );
  }
}
