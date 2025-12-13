import jwt from 'jsonwebtoken';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AuthUser } from './auth';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'arise-app',
    audience: 'arise-users',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'arise-app',
    audience: 'arise-users',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {
      issuer: 'arise-app',
      audience: 'arise-users',
    };
    const decoded = jwt.verify(token, JWT_SECRET, options) as TokenPayload;
    return decoded;
  } catch (error) {
    // Log the error for debugging
    if (error instanceof Error) {
      console.error('Token verification error:', error.message);
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {
      issuer: 'arise-app',
      audience: 'arise-users',
    };
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, options) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
