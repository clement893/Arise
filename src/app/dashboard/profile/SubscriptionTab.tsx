'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CreditCard, Download, ExternalLink, AlertCircle, CheckCircle, XCircle, Calendar, Receipt } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  billingCycle: string;
}

interface Subscription {
  id: number;
  plan: string;
  status: string;
  price: number;
  currency: string;
  billingCycle: string;
  startDate?: string;
  endDate?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  hasCoaching: boolean;
  coachingSessions: number;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  pdfUrl: string;
  hostedUrl: string;
  description: string;
}

interface UpcomingInvoice {
  amount: number;
  currency: string;
  date: number;
}

interface SubscriptionData {
  user: {
    plan: string;
    billingCycle: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  };
  subscription: Subscription | null;
  invoices: Invoice[];
  upcomingInvoice: UpcomingInvoice | null;
}

interface CoachingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  sessions: number;
}

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 0,
    description: 'Free access to basic assessments',
    features: ['TKI Assessment', '360° Self-Assessment', 'Basic Development Plan', 'Email Support'],
    popular: false,
  },
  {
    id: 'individual',
    name: 'INDIVIDUAL',
    price: 4900,
    description: 'For professionals seeking personal growth',
    features: ['All 4 assessments (MBTI, TKI, 360°, Wellness)', 'Comprehensive leadership report', 'Personal development plan', 'Progress tracking dashboard', 'Email support'],
    popular: true,
  },
  {
    id: 'coach',
    name: 'COACH',
    price: 14900,
    description: 'For coaches and consultants',
    features: ['Everything in Individual', 'Up to 25 client accounts', 'Client management dashboard', 'White-label reports', 'Group analytics', 'Priority support'],
    popular: false,
  },
  {
    id: 'business',
    name: 'BUSINESS',
    price: 49900,
    description: 'For organizations and teams',
    features: ['Everything in Coach', 'Unlimited team members', 'Team analytics & insights', 'Custom branding', 'API access', 'Dedicated account manager'],
    popular: false,
  },
];

export default function SubscriptionTab({ user }: { user: User }) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [coachingPackages, setCoachingPackages] = useState<CoachingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedCoaching, setSelectedCoaching] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Use authenticatedFetch to include Authorization header
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      
      // Load subscription data
      const subResponse = await authenticatedFetch('/api/subscription');
      if (subResponse.ok) {
        const data = await subResponse.json();
        setSubscriptionData(data);
      } else if (subResponse.status === 401) {
        setMessage({ type: 'error', text: 'Please log in to view your subscription' });
      }

      // Load coaching packages
      const coachResponse = await authenticatedFetch('/api/subscription/coaching');
      if (coachResponse.ok) {
        const data = await coachResponse.json();
        setCoachingPackages(data.packages);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setMessage({ type: 'error', text: 'Failed to load subscription data. Please try again.' });
    }
    setIsLoading(false);
  };

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    setMessage(null);

    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start checkout' });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setMessage({ type: 'error', text: 'Failed to upgrade. Please try again.' });
    }

    setIsUpgrading(false);
  };

  const handleBuyCoaching = async (packageId: string) => {
    setSelectedCoaching(packageId);
    setMessage(null);

    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/subscription/coaching', {
        method: 'POST',
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start checkout' });
      }
    } catch (error) {
      console.error('Coaching purchase error:', error);
      setMessage({ type: 'error', text: 'Failed to purchase coaching. Please try again.' });
    }

    setSelectedCoaching(null);
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    setMessage(null);

    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/subscription', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open billing portal' });
      }
    } catch (error) {
      console.error('Manage subscription error:', error);
      setMessage({ type: 'error', text: 'Failed to open billing portal. Please try again.' });
    }

    setIsManaging(false);
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setMessage(null);

    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/subscription', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowCancelConfirm(false);
        loadData(); // Reload data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription' });
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    }

    setIsCancelling(false);
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const currentPlan = subscriptionData?.user?.plan || user.plan || 'starter';
  const subscription = subscriptionData?.subscription;
  const invoices = subscriptionData?.invoices || [];
  const upcomingInvoice = subscriptionData?.upcomingInvoice;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Current Plan */}
      <section>
        <h2 className="text-gray-900 font-semibold mb-4">Current Plan</h2>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-primary-500 font-bold text-xl">{currentPlan.toUpperCase()}</h3>
              <p className="text-sm text-gray-500">
                {subscription?.status === 'cancelled' 
                  ? 'Subscription cancelled - access until end of billing period'
                  : `Billed ${subscription?.billingCycle || 'monthly'}`
                }
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(subscription?.price || PLANS.find(p => p.id === currentPlan)?.price || 0)}
              </span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-xs rounded-full ${
              subscription?.status === 'cancelled' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {subscription?.status || 'active'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">360 Feedback</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Wellness Plan</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Development Plan</span>
            {subscription?.hasCoaching && (
              <span className="px-3 py-1 bg-secondary-500 text-white text-xs rounded-full">
                {subscription.coachingSessions} Coaching Sessions
              </span>
            )}
          </div>

          {/* Subscription Actions */}
          {subscriptionData?.user?.stripeCustomerId && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleManageSubscription}
                disabled={isManaging}
                className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg font-medium hover:bg-primary-500/5 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isManaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Manage Billing
              </button>
              {subscription?.status !== 'cancelled' && currentPlan !== 'starter' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-4">
              Your subscription will remain active until the end of your current billing period. 
              After that, you will be downgraded to the free Starter plan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plans */}
      <section>
        <h2 className="text-gray-900 font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`border rounded-lg p-5 ${
                plan.id === currentPlan 
                  ? 'border-primary-500 bg-primary-500/5' 
                  : plan.popular 
                    ? 'border-secondary-500' 
                    : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-2 py-1 bg-secondary-500 text-white text-xs rounded mb-2">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-gray-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary-500 my-2">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                {plan.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isUpgrading || plan.id === currentPlan}
                className={`w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  plan.id === currentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {isUpgrading && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.id === currentPlan ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Coaching Packages */}
      <section>
        <h2 className="text-gray-900 font-semibold mb-4">Add Coaching Sessions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {coachingPackages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900">{pkg.name}</h3>
              <p className="text-2xl font-bold text-secondary-500 my-2">{pkg.priceFormatted}</p>
              <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
              <button
                onClick={() => handleBuyCoaching(pkg.id)}
                disabled={selectedCoaching === pkg.id}
                className="w-full py-2 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {selectedCoaching === pkg.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Purchase
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Invoice */}
      {upcomingInvoice && (
        <section>
          <h2 className="text-gray-900 font-semibold mb-4">Upcoming Payment</h2>
          <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Next billing date</p>
                <p className="text-sm text-gray-500">{formatDate(upcomingInvoice.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(upcomingInvoice.amount)} {upcomingInvoice.currency.toUpperCase()}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Payment History */}
      <section>
        <h2 className="text-gray-900 font-semibold mb-4">Payment History</h2>
        {invoices.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(invoice.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{invoice.description}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatPrice(invoice.amount)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : invoice.status === 'open'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                        {invoice.status === 'open' && <AlertCircle className="w-3 h-3" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {invoice.hostedUrl && (
                          <a
                            href={invoice.hostedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View Invoice"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment history yet</p>
            <p className="text-sm text-gray-400">Your invoices will appear here after your first payment</p>
          </div>
        )}
      </section>

      {/* Coaching CTA */}
      <section className="bg-primary-500 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold !text-white mb-2">Ready to accelerate your growth?</h2>
            <p className="text-white/80 mb-4">
              Connect with expert ARISE coaches who specialize in leadership development. 
              Schedule your FREE coaching session to debrief your results and build a personalized development plan.
            </p>
            <Link
              href="/coaching"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-500 text-primary-500 rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
            >
              Explore coaching options →
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-secondary-500 flex items-center justify-center">
              <span className="text-primary-500 text-2xl">👤</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
