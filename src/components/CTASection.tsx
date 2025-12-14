'use client';

/**
 * CTA Section Component
 * 
 * Call-to-action section with gradient background.
 * Uses white text for proper contrast on the gradient background.
 */

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { buttonVariants } from '@/lib/button-variants';
import { cn } from '@/lib/utils';

export default function CTASection() {
  return (
    <section className="bg-[#c9a961] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          {/* Dark text for contrast on gold background */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">
            Ready to elevate your leadership?
          </h2>
          <p className="text-[#333333] max-w-2xl mx-auto text-base md:text-lg">
            Join thousands of leaders transforming their approach to personal growth and organizational change.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link 
              href="/signup"
              className={cn(buttonVariants({ variant: 'dark', size: 'lg' }), 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]')}
            >
              Schedule a demo
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-colors bg-transparent border-2 border-[#333333] text-[#333333] hover:bg-white"
            >
              Explore our tools
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
