'use client';

import { Button, Card, CardContent, Input, Badge } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';

export default function ReviewConfirm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    
    try {
      // For now, just proceed to profile step
      // The actual user creation will happen after profile completion
      router.push('/signup/profile');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout currentStep={5}>
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
            Review & confirm
          </h1>
          <p className="text-neutral-800/60">
            Please review your selection before proceeding
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Order summary */}
        <div className="space-y-6 mb-8">
          {/* Plan details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-neutral-800 capitalize">{signupData.plan} Plan</h3>
                <p className="text-sm text-neutral-800/60 capitalize">{signupData.billingCycle} billing</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-neutral-800">${currentPrice}</p>
                <p className="text-sm text-neutral-800/60">/month</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/signup/choose-plan')}
              className="text-sm text-primary-500 hover:underline"
            >
              Change plan
            </button>
          </div>

          {/* Account details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-800 mb-2">Account</h3>
            <p className="text-neutral-800/70">{signupData.email}</p>
            <button 
              onClick={() => router.push('/signup/create-account')}
              className="text-sm text-primary-500 hover:underline mt-2"
            >
              Change email
            </button>
          </div>

          {/* Payment method placeholder */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-800 mb-4">Payment method</h3>
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm text-neutral-800">•••• •••• •••• 4242</p>
                <p className="text-xs text-neutral-800/60">Expires 12/25</p>
              </div>
            </div>
            <button className="text-sm text-primary-500 hover:underline mt-3">
              Add payment method
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-neutral-800/50 text-center mb-6">
          By confirming, you agree to our{' '}
          <a href="/terms" className="text-primary-500 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</a>.
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="text-neutral-800/60 hover:text-neutral-800 font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-secondary-500 hover:bg-[#C49A3D] text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm →'}
          </button>
        </div>
      </div>
    </SignupLayout>
  );
}
