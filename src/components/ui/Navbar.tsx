'use client';

import { forwardRef, HTMLAttributes, ReactNode, useState } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';

/**
 * Navbar variants
 */
const navbarVariants = cva(
  ['w-full transition-all duration-200'],
  {
    variants: {
      variant: {
        default: 'bg-white border-b border-neutral-200',
        transparent: 'bg-transparent',
        dark: 'bg-neutral-900 text-white',
        primary: 'bg-primary-500 text-white',
      },
      sticky: {
        true: 'sticky top-0 z-40',
        false: '',
      },
      shadow: {
        true: 'shadow-sm',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      sticky: true,
      shadow: true,
    },
  }
);

interface NavbarProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  /** Logo element or text */
  logo?: ReactNode;
  /** Navigation links */
  children?: ReactNode;
  /** Right side actions (buttons, user menu, etc.) */
  actions?: ReactNode;
  /** Maximum width container class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Navbar component - Main navigation header
 */
const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ variant, sticky, shadow, logo, children, actions, maxWidth = 'xl', className, ...props }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    };

    return (
      <header
        ref={ref}
        className={cn(navbarVariants({ variant, sticky, shadow }), className)}
        {...props}
      >
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            {logo && <div className="flex-shrink-0">{logo}</div>}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {children}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {actions}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-4 space-y-2" aria-label="Mobile navigation">
              {children}
            </nav>
            {actions && (
              <div className="px-4 py-4 border-t border-neutral-200 space-y-2">
                {actions}
              </div>
            )}
          </div>
        )}
      </header>
    );
  }
);

Navbar.displayName = 'Navbar';

/**
 * NavLink variants
 */
const navLinkVariants = cva(
  [
    'inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
        active: 'text-primary-600 bg-primary-50',
        light: 'text-white/80 hover:text-white hover:bg-white/10',
        'light-active': 'text-white bg-white/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface NavLinkProps extends VariantProps<typeof navLinkVariants> {
  href: string;
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

/**
 * NavLink component for navbar navigation items
 */
const NavLink = ({ href, children, variant, isActive, className }: NavLinkProps) => {
  const computedVariant = isActive ? 'active' : variant;

  return (
    <Link href={href} className={cn(navLinkVariants({ variant: computedVariant }), className)}>
      {children}
    </Link>
  );
};

/**
 * NavDropdown - Dropdown menu for navbar
 */
interface NavDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

const NavDropdown = ({ trigger, children, className }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        type="button"
        className={cn(navLinkVariants({ variant: 'default' }), 'gap-1', className)}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * NavDropdownItem - Item inside a dropdown menu
 */
interface NavDropdownItemProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const NavDropdownItem = ({ href, onClick, children, className }: NavDropdownItemProps) => {
  const baseClasses = 'block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors';

  if (href) {
    return (
      <Link href={href} className={cn(baseClasses, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(baseClasses, className)}>
      {children}
    </button>
  );
};

export { Navbar, NavLink, NavDropdown, NavDropdownItem, navbarVariants, navLinkVariants };
export default Navbar;

export type { NavbarProps, NavLinkProps };
