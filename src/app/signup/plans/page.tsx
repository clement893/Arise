'use client';

import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';

export default function SignupPlans() {
  const router = useRouter();

  const features = [
    {
      title: 'Personality Assessment',
      description: 'Comprehensive MBTI-based personality typing to understand your natural preferences and strengths.',
      included: true
    },
    {
      title: 'Conflict Management',
      description: 'TKI assessment to discover your conflict-handling modes and improve team dynamics.',
      included: true
    },
    {
      title: '360° Feedback',
      description: 'Multi-perspective feedback from peers, managers, and direct reports for complete self-awareness.',
      included: true
    },
    {
      title: 'Wellness Assessment',
      description: 'Holistic evaluation of physical, mental, and emotional well-being for peak performance.',
      included: true
    },
    {
      title: 'Personalized Report',
      description: 'Detailed leadership profile with actionable insights and development recommendations.',
      included: true
    }
  ];

  const handleContinue = () => {
    router.push('/signup/choose-plan');
  };

  return (
    <SignupLayout currentStep={2}>
      <div className="bg-white rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
            Discover our plans
          </h1>
          <p className="text-neutral-800/60">
            Everything you need to develop authentic leadership
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-neutral-800/60">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="text-neutral-800/60 hover:text-neutral-800 font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="bg-secondary-500 hover:bg-[#C49A3D] text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </SignupLayout>
  );
}
