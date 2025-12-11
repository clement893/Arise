'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Spinner variants
 */
const spinnerVariants = cva(
  ['animate-spin rounded-full border-2 border-current border-t-transparent'],
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
      color: {
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        white: 'text-white',
        neutral: 'text-neutral-500',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Spinner color */
  color?: 'primary' | 'secondary' | 'white' | 'neutral';
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Spinner component - Loading indicator
 */
const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size, color, label = 'Loading', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * LoadingPage - Full page loading state
 */
interface LoadingPageProps {
  message?: string;
}

const LoadingPage = ({ message = 'Loading...' }: LoadingPageProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50" role="status" aria-live="polite">
      <Spinner size="xl" />
      <p className="mt-4 text-neutral-600 font-medium">{message}</p>
    </div>
  );
};

/**
 * LoadingInline - Inline loading indicator
 */
interface LoadingInlineProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingInline = ({ message, size = 'md' }: LoadingInlineProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8" role="status" aria-live="polite">
      <Spinner size={size} />
      {message && <span className="text-neutral-600">{message}</span>}
    </div>
  );
};

/**
 * LoadingOverlay - Overlay loading state
 */
interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

const LoadingOverlay = ({ message = 'Loading...', isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center">
        <Spinner size="xl" />
        <p className="mt-4 text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * Skeleton variants
 */
const skeletonVariants = cva(
  ['animate-pulse bg-neutral-200 rounded'],
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'rounded-full',
        button: 'h-10 w-24 rounded-lg',
        card: 'h-48 w-full rounded-xl',
        image: 'aspect-video w-full rounded-lg',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'image';
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
}

/**
 * Skeleton component - Loading placeholder
 */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant, className, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        style={{ width, height, ...style }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * SkeletonText - Multiple lines of skeleton text
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard - Card loading placeholder
 */
const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 p-6 space-y-4', className)} aria-hidden="true">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/2" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
};

/**
 * SkeletonTable - Table loading placeholder
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const SkeletonTable = ({ rows = 5, columns = 4, className }: SkeletonTableProps) => {
  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 overflow-hidden', className)} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-neutral-50 border-b border-neutral-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-neutral-100 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export {
  Spinner,
  LoadingPage,
  LoadingInline,
  LoadingOverlay,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  spinnerVariants,
  skeletonVariants,
};
export default Spinner;

export type { SpinnerProps, SkeletonProps };
