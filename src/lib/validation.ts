import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 */

// Email validation
export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

// Password validation - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Signup schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().max(100).optional().nullable(),
  lastName: z.string().trim().max(100).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  jobTitle: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
  userType: z.enum(['individual', 'coach', 'business']).optional(),
  plan: z.enum(['starter', 'professional', 'enterprise']).optional(),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
});

// Assessment submission schema
export const assessmentSubmissionSchema = z.object({
  answers: z.record(z.string(), z.union([z.number(), z.string()])),
  assessmentType: z.enum(['tki', 'wellness', 'self_360', 'mbti']),
});

// Evaluator creation schema
export const evaluatorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: emailSchema,
  relationship: z.enum(['manager', 'peer', 'direct_report', 'other']),
});

// Feedback submission schema
export const feedbackSubmissionSchema = z.object({
  answers: z.record(z.string(), z.number().min(1).max(5)),
});

// Assessment config schema
export const assessmentConfigSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  duration: z.number().int().min(1).max(120),
  questionCount: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Question schema
export const questionSchema = z.object({
  text: z.string().trim().min(1, 'Question text is required').max(1000),
  category: z.string().trim().max(100).optional().nullable(),
  order: z.number().int().min(0).optional(),
});

// User action schema (admin)
export const userActionSchema = z.object({
  userId: z.number().int().positive(),
  action: z.enum(['make_admin', 'make_participant', 'make_coach', 'delete', 'view', 'edit']),
});

// Stripe checkout schema
export const stripeCheckoutSchema = z.object({
  planId: z.enum(['individual', 'coach', 'business']),
  userId: z.number().int().positive().optional(),
  userEmail: emailSchema.optional(),
});

/**
 * Validate request body against schema
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError?.message || 'Validation failed',
    details: result.error,
  };
}

/**
 * Safe parse with better error messages
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
