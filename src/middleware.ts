import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from './lib/jwt';

/**
 * Middleware to protect API routes
 * Checks JWT token in Authorization header
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh',
    '/api/feedback', // Feedback routes use token-based auth
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Skip middleware for non-API routes (handled by page-level auth)
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Extract and verify token
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    console.log('Middleware: No token found in Authorization header');
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    );
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    console.log('Middleware: Token verification failed for path:', pathname);
    return NextResponse.json(
      { error: 'Invalid or expired token', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    );
  }

  console.log('Middleware: Token verified successfully for user:', payload.userId);

  // Add user info to headers for use in route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId.toString());
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
