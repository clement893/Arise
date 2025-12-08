'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';

export default function ReviewConfirm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState({
    userType: '',
    plan: '',
    billingCycle: '',
    email: ''
  });

  useEffect(() => {
    // Get data from localStorage
    setSignupData({
      userType: localStorage.getItem('signupUserType') || 'individual',
      plan: localStorage.getItem('signupPlan') || 'professional',
      billingCycle: localStorage.getItem('signupBillingCycle') || 'monthly',
      email: localStorage.getItem('signupEmail') || ''
    });
  }, []);

  const planPrices: Record<string, { monthly: number; annual: number }> = {
    starter: { monthly: 49, annual: 39 },
    professional: { monthly: 99, annual: 79 },
    enterprise: { monthly: 199, annual: 159 }
  };

  const currentPrice = planPrices[signupData.plan]?.[signupData.billingCycle as 'monthly' | 'annual'] || 99;

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/signup/profile');
  };

  return (
    <SignupLayout currentStep={5}>
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-4">
            Review & confirm
          </h1>
          <p className="text-[#2D2D2D]/60">
            Please review your selection before proceeding
          </p>
        </div>

        {/* Order summary */}
        <div className="space-y-6 mb-8">
          {/* Plan details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-[#2D2D2D] capitalize">{signupData.plan} Plan</h3>
                <p className="text-sm text-[#2D2D2D]/60 capitalize">{signupData.billingCycle} billing</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-[#2D2D2D]">${currentPrice}</p>
                <p className="text-sm text-[#2D2D2D]/60">/month</p>
              </div>
            </div>
            <button className="text-sm text-[#0D5C5C] hover:underline">
              Change plan
            </button>
          </div>

          {/* Account details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-2">Account</h3>
            <p className="text-[#2D2D2D]/70">{signupData.email}</p>
            <button className="text-sm text-[#0D5C5C] hover:underline mt-2">
              Change email
            </button>
          </div>

          {/* Payment method placeholder */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-4">Payment method</h3>
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm text-[#2D2D2D]">•••• •••• •••• 4242</p>
                <p className="text-xs text-[#2D2D2D]/60">Expires 12/25</p>
              </div>
            </div>
            <button className="text-sm text-[#0D5C5C] hover:underline mt-3">
              Add payment method
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-[#2D2D2D]/50 text-center mb-6">
          By confirming, you agree to our{' '}
          <a href="/terms" className="text-[#0D5C5C] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-[#0D5C5C] hover:underline">Privacy Policy</a>.
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="text-[#2D2D2D]/60 hover:text-[#2D2D2D] font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#D4A84B] hover:bg-[#C49A3D] text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm →'}
          </button>
        </div>
      </div>
    </SignupLayout>
  );
}
