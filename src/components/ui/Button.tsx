'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variants using class-variance-authority
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-500 text-white',
          'hover:bg-primary-600',
          'focus:ring-primary-500/50',
        ],
        secondary: [
          'bg-secondary-500 text-primary-700',
          'hover:bg-secondary-600',
          'focus:ring-secondary-500/50',
        ],
        outline: [
          'bg-transparent border-2 border-primary-500 text-primary-500',
          'hover:bg-primary-500 hover:text-white',
          'focus:ring-primary-500/50',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'focus:ring-neutral-500/50',
        ],
        danger: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-500/50',
        ],
        success: [
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'focus:ring-green-500/50',
        ],
        link: [
          'bg-transparent text-primary-500 underline-offset-4',
          'hover:underline',
          'focus:ring-primary-500/50',
        ],
        white: [
          'bg-white text-neutral-800 border border-neutral-200',
          'hover:bg-neutral-50',
          'focus:ring-neutral-500/50',
        ],
        dark: [
          'bg-neutral-800 text-white',
          'hover:bg-neutral-900',
          'focus:ring-neutral-500/50',
        ],
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
        icon: 'p-2',
        'icon-sm': 'p-1.5',
        'icon-lg': 'p-3',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
  /** Icon to display on the left side */
  leftIcon?: ReactNode;
  /** Icon to display on the right side */
  rightIcon?: ReactNode;
  /** Button content */
  children: ReactNode;
  /** Accessible label for screen readers (required if children is not text) */
  'aria-label'?: string;
}

/**
 * Button component with multiple variants, sizes, and states
 * 
 * @example
 * // Primary button
 * <Button variant="primary">Click me</Button>
 * 
 * @example
 * // Loading button
 * <Button isLoading>Saving...</Button>
 * 
 * @example
 * // Button with icon
 * <Button leftIcon={<PlusIcon />}>Add Item</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
export default Button;
