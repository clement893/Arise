/**
 * Standardized Error Handling System
 * Provides consistent error types and handling across the application
 */

/**
 * Custom error classes for different error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, 'CONFLICT_ERROR', 409, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  details?: unknown;
  timestamp?: string;
}

/**
 * Convert an error to a standardized error response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle errors in API routes
 * Returns a NextResponse with the error formatted consistently
 */
export function handleApiError(error: unknown): Response {
  const errorResponse = formatErrorResponse(error);
  
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorResponse);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: errorResponse.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

import { NextResponse } from 'next/server';

/**
 * Handle errors in Next.js API routes
 * Returns a NextResponse with the error formatted consistently
 * This is an alias for handleApiError but returns NextResponse for Next.js compatibility
 */

export function handleError(error: unknown): NextResponse {
  const errorResponse = formatErrorResponse(error);
  
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorResponse);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  const responseBody: {
    error: string;
    code: string;
    details?: unknown;
  } = {
    error: errorResponse.error,
    code: errorResponse.code,
  };

  if (errorResponse.details !== undefined) {
    responseBody.details = errorResponse.details;
  }

  return NextResponse.json(
    responseBody,
    { status: errorResponse.statusCode }
  );
}

/**
 * Handle errors in client-side code
 * Returns a user-friendly error message
 */
export function handleClientError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error: unknown): boolean {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError;
}
