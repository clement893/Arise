'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D5C5C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 C30 30, 20 50, 30 70 C40 90, 60 90, 70 70 C80 50, 70 30, 50 10" 
                    fill="#0D5C5C" stroke="white" strokeWidth="3"/>
              <path d="M45 40 C35 50, 35 65, 50 70 C65 65, 65 50, 55 40" 
                    fill="none" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="text-white font-bold text-xl tracking-wide">ARISE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#approach" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              Approach
            </Link>
            <Link href="#pricing" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="bg-[#D4A84B] hover:bg-[#C49A3D] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4">
              <Link href="#approach" className="text-white/90 hover:text-white text-sm font-medium">
                Approach
              </Link>
              <Link href="#pricing" className="text-white/90 hover:text-white text-sm font-medium">
                Pricing
              </Link>
              <Link href="#about" className="text-white/90 hover:text-white text-sm font-medium">
                About
              </Link>
              <Link href="/login" className="text-white/90 hover:text-white text-sm font-medium">
                Sign in
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#D4A84B] hover:bg-[#C49A3D] text-white px-4 py-2 rounded-full text-sm font-semibold text-center"
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
