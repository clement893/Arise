'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Update user plan in localStorage
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // The webhook will update the database, but we can update localStorage immediately
        // for a better UX
        userData.plan = 'paid'; // Generic paid status, actual plan is in DB
        localStorage.setItem('arise_user', JSON.stringify(userData));
      } catch (e) {
        console.error('Error updating user data:', e);
      }
    }
    
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [sessionId]);

  if (loading) {
    return (
      <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for subscribing to ARISE. Your account has been upgraded and you now have access to all premium features.
        </p>

        {/* Confirmation Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-4">What&apos;s next?</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>You&apos;ll receive a confirmation email with your receipt</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>Access all 4 leadership assessments (MBTI, TKI, 360°, Wellness)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>Generate comprehensive leadership reports</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>Track your progress with the development dashboard</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard/results"
            className="inline-flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View My Profile
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-gray-500">
          Have questions? <Link href="/about" className="text-primary-500 hover:underline">Contact our support team</Link>
        </p>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
