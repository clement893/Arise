import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/sendgrid';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { AuthUser } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rateLimit';
import { signupSchema, validateRequest } from '@/lib/validation';
import { ValidationError, ConflictError, handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = rateLimitMiddleware(request, RATE_LIMITS.auth);
    if (!rateLimit.allowed) {
      return rateLimit.response!;
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateRequest(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

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
    } = validation.data;

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
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Map userType to enum value
    const validUserTypes = ['individual', 'coach', 'business'] as const;
    const mappedUserType = (userType && validUserTypes.includes(userType)) ? userType : 'individual';

    // Map plan to enum value
    const validPlans = ['starter', 'professional', 'enterprise'] as const;
    const mappedPlan = (plan && validPlans.includes(plan)) ? plan : 'starter';

    // Map billingCycle to enum value
    const validBillingCycles = ['monthly', 'annual'] as const;
    const mappedBillingCycle = (billingCycle && validBillingCycles.includes(billingCycle)) ? billingCycle : 'monthly';

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

    // Create AuthUser object for token generation
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: 'participant', // New users are participants by default
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Generate tokens
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    }).then(result => {
      if (!result.success) {
        console.error('Failed to send welcome email:', result.error);
      } else {
        console.log('Welcome email sent to:', user.email);
      }
    }).catch(err => {
      console.error('Error sending welcome email:', err);
    });

    // Create response with tokens
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user,
        accessToken,
      },
      { status: 201 }
    );

    // Set refresh token in HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    return handleError(error);
  }
}
