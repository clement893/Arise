import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader } from './lib/jwt';
import { jwtVerify } from 'jose';

/**
 * Middleware to protect API routes
 * Checks JWT token in Authorization header
 * Uses jose library for Edge Runtime compatibility
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh',
    '/api/feedback', // Feedback routes use token-based auth
  ];

  // Allow public access to assessment questions (but not progress or results)
  const isPublicQuestionsRoute = pathname.startsWith('/api/assessments/') && 
                                  pathname.endsWith('/questions');

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || isPublicQuestionsRoute;
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Skip middleware for non-API routes (handled by page-level auth)
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    console.log('Middleware: No token found in Authorization header');
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    );
  }

  // Verify token using jose (Edge Runtime compatible)
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'arise-app',
      audience: 'arise-users',
    });

    // Extract user info from payload (jose returns payload as JWTPayload)
    interface JWTPayload {
      userId?: number;
      email?: string;
      role?: string;
      [key: string]: unknown;
    }
    
    const jwtPayload = payload as JWTPayload;
    const userId = jwtPayload.userId;
    const email = jwtPayload.email;
    const role = jwtPayload.role;

    if (!userId || !email || !role) {
      console.log('Middleware: Token payload missing required fields');
      return NextResponse.json(
        { error: 'Invalid token payload', code: 'AUTHENTICATION_ERROR' },
        { status: 401 }
      );
    }

    // Add user info to headers for use in route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId.toString());
    requestHeaders.set('x-user-email', email);
    requestHeaders.set('x-user-role', role);

    console.log('Middleware: Token verified successfully for user:', userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('Middleware: Token verification failed for path:', pathname);
    if (error instanceof Error) {
      console.log('Error details:', error.message);
    }
    return NextResponse.json(
      { error: 'Invalid or expired token', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    );
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
