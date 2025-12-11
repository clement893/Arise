'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupLayout from '@/components/SignupLayout';

export default function Welcome() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('signupFirstName') || 'Leader';
    setFirstName(name);
    
    // Clear signup data
    // localStorage.removeItem('signupUserType');
    // localStorage.removeItem('signupPlan');
    // localStorage.removeItem('signupBillingCycle');
    // localStorage.removeItem('signupEmail');
    // localStorage.removeItem('signupFirstName');
    // localStorage.removeItem('signupLastName');
  }, []);

  return (
    <SignupLayout currentStep={7} showProgress={false}>
      <div className="text-center py-12">
        {/* Success icon */}
        <div className="w-20 h-20 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Welcome to ARISE
        </h1>
        <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
          Hi {firstName}, your account has been created successfully. You&apos;re ready to begin your leadership journey.
        </p>

        {/* Next steps */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md mx-auto mb-8">
          <h2 className="text-white font-semibold mb-6">What&apos;s next?</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Complete your first assessment</h3>
                <p className="text-white/60 text-sm">Start with the personality assessment to understand your leadership style.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Explore your dashboard</h3>
                <p className="text-white/60 text-sm">View your progress and access all available tools.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Invite your team</h3>
                <p className="text-white/60 text-sm">Get 360° feedback from colleagues and direct reports.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-secondary-500 hover:bg-[#C49A3D] text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Start assessment →
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </SignupLayout>
  );
}
