'use client';

/**
 * Input Components
 * 
 * Provides form input elements with consistent styling and accessibility.
 * Supports both light and dark backgrounds via the `darkMode` prop.
 * 
 * Components:
 * - Input: Standard text input
 * - Textarea: Multi-line text input
 * - PasswordInput: Password input with show/hide toggle
 * - Checkbox: Checkbox with label
 */

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// VARIANTS
// =============================================================================

/**
 * Input variants using class-variance-authority
 */
const inputVariants = cva(
  [
    'w-full rounded-lg border px-4 py-2.5',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
      inputSize: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      // Theme variant for light/dark backgrounds
      theme: {
        light: 'bg-white text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-100',
        dark: 'bg-white/10 text-white placeholder:text-white/50 border-white/20 disabled:bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      theme: 'light',
    },
  }
);

// =============================================================================
// LABEL STYLES
// =============================================================================

/**
 * Get label classes based on theme
 */
const getLabelClasses = (darkMode?: boolean) => 
  cn(
    'block text-sm font-medium',
    darkMode ? 'text-white' : 'text-neutral-700'
  );

/**
 * Get helper text classes based on theme
 */
const getHelperClasses = (darkMode?: boolean) =>
  cn(
    'text-sm',
    darkMode ? 'text-white/70' : 'text-neutral-500'
  );

// =============================================================================
// INPUT COMPONENT
// =============================================================================

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** Use dark mode styling (for dark backgrounds) */
  darkMode?: boolean;
}

/**
 * Input component with label, helper text, and error states
 * Supports both light and dark backgrounds
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      inputSize,
      theme,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      darkMode = false,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
    
    // Determine theme based on darkMode prop
    const effectiveTheme = darkMode ? 'dark' : (theme || 'light');

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className={getLabelClasses(darkMode)}>
            {label}
            {required && <span className={darkMode ? 'text-red-400 ml-1' : 'text-red-500 ml-1'}>*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              darkMode ? 'text-white/50' : 'text-neutral-400'
            )}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, inputSize, theme: effectiveTheme }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              darkMode ? 'text-white/50' : 'text-neutral-400'
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className={darkMode ? 'text-sm text-red-400' : 'text-sm text-red-600'} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className={getHelperClasses(darkMode)}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  darkMode?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant, inputSize, theme, label, helperText, error, fullWidth = true, darkMode = false, className, id, rows = 4, required, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const effectiveTheme = darkMode ? 'dark' : (theme || 'light');

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={textareaId} className={getLabelClasses(darkMode)}>
            {label}
            {required && <span className={darkMode ? 'text-red-400 ml-1' : 'text-red-500 ml-1'}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(inputVariants({ variant: error ? 'error' : variant, inputSize, theme: effectiveTheme }), 'resize-none', className)}
          {...props}
        />
        {error && <p id={errorId} className={darkMode ? 'text-sm text-red-400' : 'text-sm text-red-600'} role="alert">{error}</p>}
        {helperText && !error && <p className={getHelperClasses(darkMode)}>{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// =============================================================================
// PASSWORD INPUT COMPONENT
// =============================================================================

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ darkMode = false, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      darkMode={darkMode}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            'focus:outline-none transition-colors',
            darkMode 
              ? 'text-white/50 hover:text-white' 
              : 'text-neutral-400 hover:text-neutral-600'
          )}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// =============================================================================
// CHECKBOX COMPONENT
// =============================================================================

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  darkMode?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, description, darkMode = false, className, id, ...props }, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start gap-3">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={cn(
          'h-4 w-4 rounded border-neutral-300 text-primary-500',
          'focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          darkMode && 'border-white/30 bg-white/10',
          className
        )}
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label 
              htmlFor={checkboxId} 
              className={cn(
                'text-sm font-medium cursor-pointer',
                darkMode ? 'text-white' : 'text-neutral-700'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className={cn('text-sm', darkMode ? 'text-white/70' : 'text-neutral-500')}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// =============================================================================
// EXPORTS
// =============================================================================

export { Input, Textarea, PasswordInput, Checkbox, inputVariants };
export default Input;

export type { InputProps, TextareaProps, PasswordInputProps, CheckboxProps };
