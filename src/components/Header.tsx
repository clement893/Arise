'use client';

/**
 * Header Component
 * Main navigation header for public pages
 * Uses centralized NAV_LINKS constant for maintainability
 */

import Link from 'next/link';
import { useState } from 'react';
import { buttonVariants } from '@/lib/button-variants';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  
  // Close mobile menu (used when clicking links)
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" aria-label="ARISE Home">
            <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path 
                d="M50 10 C30 30, 20 50, 30 70 C40 90, 60 90, 70 70 C80 50, 70 30, 50 10" 
                fill="currentColor" 
                className="text-primary-500" 
                stroke="white" 
                strokeWidth="3"
              />
              <path 
                d="M45 40 C35 50, 35 65, 50 70 C65 65, 65 50, 55 40" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
              />
            </svg>
            <span className="text-white font-bold text-xl tracking-wide">ARISE</span>
          </Link>

          {/* Desktop Navigation - uses NAV_LINKS constant */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-white hover:text-secondary-500 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-white hover:text-secondary-500 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup"
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            type="button"
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - uses NAV_LINKS constant */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-white hover:text-secondary-500 text-sm font-medium" 
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/login" 
                className="text-white hover:text-secondary-500 text-sm font-medium" 
                onClick={closeMenu}
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-full text-center')}
                onClick={closeMenu}
              >
                Get Started →
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
