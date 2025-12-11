'use client';

/**
 * Select Component
 * 
 * Provides a styled dropdown select with label and error states.
 * Supports both light and dark backgrounds via the `darkMode` prop.
 */

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// =============================================================================
// VARIANTS
// =============================================================================

const selectVariants = cva(
  [
    'w-full appearance-none rounded-lg border',
    'px-4 py-2.5 pr-10',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      },
      selectSize: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      // Theme variant for light/dark backgrounds
      theme: {
        light: 'bg-white text-neutral-900 disabled:bg-neutral-100',
        dark: 'bg-white/10 text-white border-white/20 disabled:bg-white/5',
      },
    },
    defaultVariants: { variant: 'default', selectSize: 'md', theme: 'light' },
  }
);

// =============================================================================
// TYPES
// =============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  /** Use dark mode styling (for dark backgrounds) */
  darkMode?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ variant, selectSize, theme, label, helperText, error, options, placeholder, fullWidth = true, darkMode = false, className, id, required, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const effectiveTheme = darkMode ? 'dark' : (theme || 'light');
    
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={selectId} 
            className={cn(
              'block text-sm font-medium',
              darkMode ? 'text-white' : 'text-neutral-700'
            )}
          >
            {label}
            {required && <span className={darkMode ? 'text-red-400 ml-1' : 'text-red-500 ml-1'}>*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              selectVariants({ variant: error ? 'error' : variant, selectSize, theme: effectiveTheme }), 
              className
            )}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((o) => (
              <option 
                key={o.value} 
                value={o.value} 
                disabled={o.disabled}
                className="text-neutral-900 bg-white"
              >
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown 
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none',
              darkMode ? 'text-white/50' : 'text-neutral-400'
            )} 
          />
        </div>
        {error && (
          <p className={darkMode ? 'text-sm text-red-400' : 'text-sm text-red-600'} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={cn('text-sm', darkMode ? 'text-white/70' : 'text-neutral-500')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// =============================================================================
// EXPORTS
// =============================================================================

export { Select, selectVariants };
export default Select;

export type { SelectOption, SelectProps };
