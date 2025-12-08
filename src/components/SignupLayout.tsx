'use client';

import Link from 'next/link';

interface SignupLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps?: number;
  showProgress?: boolean;
}

export default function SignupLayout({ 
  children, 
  currentStep, 
  totalSteps = 7,
  showProgress = true 
}: SignupLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D5C5C]">
      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 C30 30, 20 50, 30 70 C40 90, 60 90, 70 70 C80 50, 70 30, 50 10" 
                    fill="#0D5C5C" stroke="white" strokeWidth="3"/>
              <path d="M45 40 C35 50, 35 65, 50 70 C65 65, 65 50, 55 40" 
                    fill="none" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="text-white font-bold text-xl">ARISE</span>
          </Link>
          
          <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
            Sign in instead
          </Link>
        </div>
      </header>

      {/* Progress indicator */}
      {showProgress && (
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D4A84B] rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
