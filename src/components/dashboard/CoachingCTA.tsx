'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoachingCTA() {
  const router = useRouter();

  const handleExploreCoaching = () => {
    // Navigate to results page where coaching modal is available
    router.push('/dashboard/results');
  };

  return (
    <div className="bg-primary-500 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden relative">
      {/* Content */}
      <div className="relative z-10 max-w-lg flex-1">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
          Ready to accelerate your growth?
        </h3>
        <p className="text-white/80 text-xs sm:text-sm mb-4 sm:mb-6">
          Connect with expert ARISE coaches who specialize in leadership development. 
          Schedule your FREE coaching session to debrief your results and build a 
          personalized development plan.
        </p>
        <button 
          onClick={handleExploreCoaching}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-secondary-500 text-primary-500 rounded-lg font-semibold text-xs sm:text-sm hover:bg-secondary-600 transition-colors"
          aria-label="Explore coaching options"
        >
          Explore coaching options
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Decorative circle - hidden on mobile, visible on larger screens */}
      <div className="hidden lg:block absolute right-32 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-2xl" aria-hidden="true">💬</span>
        </div>
      </div>

      {/* Image placeholder - hidden on mobile, visible on larger screens */}
      <div className="hidden lg:flex relative z-10 w-48 xl:w-64 h-32 xl:h-40 rounded-xl overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
        <div className="text-center text-gray-500">
          <span className="text-3xl xl:text-4xl" aria-hidden="true">👥</span>
          <p className="text-xs mt-1">Coaching Image</p>
        </div>
      </div>
    </div>
  );
}
