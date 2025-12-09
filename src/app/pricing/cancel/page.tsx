'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was not completed. No charges have been made to your account.
          </p>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Changed your mind?</h2>
            <p className="text-gray-600 mb-4">
              No worries! You can still explore ARISE with our free features or come back anytime to subscribe. Here's what you can do:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Continue using the free version of ARISE</li>
              <li>• Compare our plans to find the best fit for you</li>
              <li>• Contact us if you have questions about pricing</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center bg-[#0D5C5C] hover:bg-[#0a4a4a] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Pricing
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue with Free
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-sm text-gray-500">
            Need help deciding? <Link href="/about" className="text-[#0D5C5C] hover:underline">Talk to our team</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
