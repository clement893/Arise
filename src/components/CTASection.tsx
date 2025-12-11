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
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="gradient" className="p-8 md:p-12 text-center">
          <CardContent className="space-y-6">
            {/* White text for contrast on gradient background */}
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to elevate your leadership?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Join thousands of leaders transforming their approach to personal growth and organizational change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link 
                href="/signup"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
              >
                Schedule a demo
              </Link>
              <Link 
                href="/pricing"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-white text-white hover:bg-white hover:text-primary-500')}
              >
                Explore our tools
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
