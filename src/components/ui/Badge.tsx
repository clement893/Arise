'use client';

import { ReactNode, HTMLAttributes } from 'react';

type BadgeVariant = 
  | 'neutral'
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'admin'
  | 'coach'
  | 'participant'
  | 'user'
  | 'completed'
  | 'in-progress'
  | 'pending'
  | 'cancelled'
  | 'scheduled';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  dot?: boolean;
  outline?: boolean;
}

/**
 * Badge component using ARISE Design System tokens
 * Styles are defined in src/styles/badges.css
 */

// Map variant to CSS class
const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  admin: 'badge-admin',
  coach: 'badge-coach',
  participant: 'badge-participant',
  user: 'badge-user',
  completed: 'badge-completed',
  'in-progress': 'badge-in-progress',
  pending: 'badge-pending',
  cancelled: 'badge-cancelled',
  scheduled: 'badge-scheduled',
};

const outlineClasses: Record<string, string> = {
  primary: 'badge-outline-primary',
  secondary: 'badge-outline-secondary',
  success: 'badge-outline-success',
  error: 'badge-outline-error',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  dot = false,
  outline = false,
  className = '',
  ...props
}: BadgeProps) {
  // Use outline variant if available and requested
  const baseClass = outline && outlineClasses[variant] 
    ? outlineClasses[variant] 
    : variantClasses[variant];

  return (
    <span
      className={`${baseClass} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className="status-dot" style={{ backgroundColor: 'currentColor' }} />
      )}
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant, BadgeSize };
