'use client';

/**
 * Reset Password Page
 * 
 * Allows users to reset their password using a token from the email.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, PasswordInput } from '@/components/ui';

// Force dynamic rendering to avoid pre-rendering issues with useSearchParams
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    // Optionally validate token with API
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          const data = await response.json();
          setError(data.error || 'Invalid or expired reset token. Please request a new password reset link.');
        }
      } catch {
        setTokenValid(false);
        setError('Failed to validate reset token. Please try again.');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-primary-500 relative overflow-hidden flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/forgot-password">
              <Button variant="primary" fullWidth>
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-500 relative overflow-hidden flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <Link href="/login">
              <Button variant="primary" fullWidth>
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-500 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-6">
        <Link href="/" className="flex items-center gap-2">
          <svg width="40" height="45" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 5C20 5 15 15 15 25C15 35 20 40 30 45C40 40 45 35 45 25C45 15 40 5 30 5Z" stroke="var(--color-secondary-500)" strokeWidth="2" fill="none"/>
            <path d="M30 15C25 15 22 20 22 27C22 34 25 38 30 42C35 38 38 34 38 27C38 20 35 15 30 15Z" stroke="var(--color-secondary-500)" strokeWidth="2" fill="none"/>
            <path d="M30 25C28 25 26 28 26 32C26 36 28 39 30 42C32 39 34 36 34 32C34 28 32 25 30 25Z" fill="var(--color-secondary-500)"/>
            <path d="M30 45C30 55 35 60 35 65" stroke="var(--color-secondary-500)" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-white text-xl font-semibold">ARISE</span>
        </Link>
        <Link href="/login" className="text-white hover:text-secondary-500 transition-colors text-sm">
          Back to login
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500/20 rounded-full mb-4">
              <Lock className="w-8 h-8 text-secondary-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-500 mb-2">
              Reset your password
            </h1>
            <p className="text-white/80">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Password */}
            <PasswordInput
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              darkMode
              autoFocus
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              darkMode
            />

            {/* Submit button */}
            <Button
              type="submit"
              variant="secondary"
              fullWidth
              isLoading={isLoading || tokenValid === null}
              disabled={tokenValid !== true}
              rightIcon={!isLoading && tokenValid === true ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </Button>

            {/* Back to login */}
            <p className="text-center text-white/80 mt-6">
              Remember your password?{' '}
              <Link href="/login" className="text-secondary-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-500 relative overflow-hidden flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500/20 rounded-full mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-secondary-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait while we validate your reset link.</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

