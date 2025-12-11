'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

const plans = [
  {
    id: 'individual',
    name: 'Individual',
    description: 'For professionals seeking personal growth',
    price: 49,
    period: 'month',
    features: [
      'All 4 assessments (MBTI, TKI, 360°, Wellness)',
      'Comprehensive leadership report',
      'Personal development plan',
      'Progress tracking dashboard',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'coach',
    name: 'Coach',
    description: 'For coaches and consultants',
    price: 149,
    period: 'month',
    features: [
      'Everything in Individual',
      'Up to 25 client accounts',
      'Client management dashboard',
      'White-label reports',
      'Group analytics',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For organizations and teams',
    price: 499,
    period: 'month',
    features: [
      'Everything in Coach',
      'Unlimited team members',
      'Team analytics & insights',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SSO integration',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'business') {
      router.push('/about#contact');
      return;
    }

    setLoadingPlan(planId);

    try {
      const storedUser = localStorage.getItem('arise_user');
      let userId = null;
      let userEmail = null;
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userId = userData.id;
        userEmail = userData.email;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          userEmail,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Checkout error:', data.error);
        alert('Failed to start checkout. Please try again.');
        setLoadingPlan(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto px-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your leadership development journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? 'gradient' : 'bordered'}
                className={`relative p-8 ${
                  plan.popular
                    ? 'bg-primary-500 text-white ring-4 ring-secondary-500'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="warning" size="md">Most Popular</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={plan.popular ? 'text-white/80' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.popular ? 'text-white/80' : 'text-gray-600'}>
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-secondary-500' : 'text-primary-500'}`} />
                      <span className={plan.popular ? 'text-white/90' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'secondary' : 'primary'}
                  fullWidth
                  isLoading={loadingPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure payment with Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>24/7 email support</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Can I switch plans later?</h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment system.
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">
                  We offer a 14-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
