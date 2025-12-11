'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

/**
 * Input component using ARISE Design System tokens
 * Styles are defined in src/styles/forms.css
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      required = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Determine input class based on state and icons
    let inputClass = 'input';
    if (error) inputClass = 'input-error';
    if (leftIcon) inputClass += ' input-icon-left';
    if (rightIcon) inputClass += ' input-icon-right';

    return (
      <div className={`form-group ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`label ${required ? 'label-required' : ''}`}
          >
            {label}
          </label>
        )}
        <div className="input-group">
          {leftIcon && (
            <div className="input-icon input-icon-left-pos">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${inputClass} ${className}`.trim()}
            {...props}
          />
          {rightIcon && (
            <div className="input-icon input-icon-right-pos">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="helper-text-error">{error}</p>}
        {helperText && !error && (
          <p className="helper-text">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export type { InputProps };
