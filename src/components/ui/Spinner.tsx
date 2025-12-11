'use client';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'primary' | 'secondary' | 'white' | 'gray';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'border-[#0D5C5C]',
  secondary: 'border-[#D4A84B]',
  white: 'border-white',
  gray: 'border-gray-400',
};

export default function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full border-t-2 border-b-2
        ${sizeStyles[size]}
        ${colorStyles[color]}
        ${className}
      `}
    />
  );
}

// Full page loading component
interface LoadingPageProps {
  message?: string;
  color?: SpinnerColor;
}

export function LoadingPage({ message, color = 'secondary' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-[#0D5C5C] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" color={color} />
      {message && <p className="text-white/80 text-sm">{message}</p>}
    </div>
  );
}

// Inline loading component
interface LoadingInlineProps {
  message?: string;
  size?: SpinnerSize;
}

export function LoadingInline({ message, size = 'md' }: LoadingInlineProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Spinner size={size} color="primary" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';
  
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

export type { SpinnerProps, SpinnerSize, SpinnerColor, LoadingPageProps, SkeletonProps };
