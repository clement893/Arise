'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';

type PlanType = 'starter' | 'professional' | 'enterprise';
type BillingCycle = 'monthly' | 'annual';

export default function ChoosePlan() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const plans = [
    {
      id: 'starter' as PlanType,
      name: 'Starter',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Perfect for individuals starting their leadership journey',
      features: [
        'All 4 assessments',
        'Personal dashboard',
        'Basic reports',
        'Email support'
      ]
    },
    {
      id: 'professional' as PlanType,
      name: 'Professional',
      monthlyPrice: 99,
      annualPrice: 79,
      description: 'For serious leaders committed to growth',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Priority support',
        '1-on-1 coaching session'
      ],
      popular: true
    },
    {
      id: 'enterprise' as PlanType,
      name: 'Enterprise',
      monthlyPrice: 199,
      annualPrice: 159,
      description: 'For teams and organizations',
      features: [
        'Everything in Professional',
        'Team dashboards',
        'Custom integrations',
        'Dedicated account manager'
      ]
    }
  ];

  const handleContinue = () => {
    if (selectedPlan) {
      localStorage.setItem('signupPlan', selectedPlan);
      localStorage.setItem('signupBillingCycle', billingCycle);
      router.push('/signup/create-account');
    }
  };

  return (
    <SignupLayout currentStep={3}>
      <div className="bg-white rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
            Choose your plan
          </h1>
          <p className="text-neutral-800/60">
            Select the plan that fits your needs
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-800/60 hover:text-neutral-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-800/60 hover:text-neutral-800'
              }`}
            >
              Annual <span className="text-secondary-500">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-xl text-left transition-all relative ${
                selectedPlan === plan.id
                  ? 'bg-primary-500 text-white ring-4 ring-secondary-500'
                  : 'bg-gray-50 text-neutral-800 hover:bg-gray-100'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              
              <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className={selectedPlan === plan.id ? 'text-white/60' : 'text-neutral-800/60'}>
                  /month
                </span>
              </div>
              <p className={`text-sm mb-4 ${selectedPlan === plan.id ? 'text-white/70' : 'text-neutral-800/60'}`}>
                {plan.description}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`text-sm flex items-center gap-2 ${
                    selectedPlan === plan.id ? 'text-white/80' : 'text-neutral-800/70'
                  }`}>
                    <svg className={`w-4 h-4 flex-shrink-0 ${
                      selectedPlan === plan.id ? 'text-secondary-500' : 'text-primary-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
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
            disabled={!selectedPlan}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              selectedPlan
                ? 'bg-secondary-500 hover:bg-[#C49A3D] text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </SignupLayout>
  );
}
