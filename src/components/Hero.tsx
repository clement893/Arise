'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui';
import { buttonVariants } from '@/lib/button-variants';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-primary-500 pt-16 overflow-hidden">
      {/* Vertical lines pattern */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-block mb-4 sm:mb-6">
            <Badge variant="secondary" size="sm">
              SaaS-Based Platform
            </Badge>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
            Empowering<br />
            authentic <span className="text-secondary-500">leaders</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 max-w-2xl">
            A holistic approach to leadership assessment and development
          </p>

          {/* CTA Button */}
          <Link 
            href="/signup"
            className={cn(buttonVariants({ variant: 'dark', size: 'lg' }), 'inline-flex items-center gap-2')}
          >
            Begin assessment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#F5F5F5"
          />
        </svg>
      </div>
    </section>
  );
}
