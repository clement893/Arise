'use client';

/**
 * Create Account Page
 * 
 * Step 4 of signup flow - user enters email and password credentials.
 * Uses light mode inputs on white background.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';
import { Button, Input, PasswordInput } from '@/components/ui';

export default function CreateAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Store email only (password should never be stored in localStorage for security)
      // Password will be passed directly to API in profile step via component state
      localStorage.setItem('signupEmail', formData.email);
      // Store password temporarily in sessionStorage (cleared after use) instead of localStorage
      // This is still not ideal but better than localStorage for sensitive data
      sessionStorage.setItem('signupPassword', formData.password);
      router.push('/signup/review');
    }
  };

  return (
    <SignupLayout currentStep={4}>
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
            Create your account
          </h1>
          <p className="text-neutral-600">
            Enter your credentials to get started
          </p>
        </div>

        <div className="space-y-6">
          {/* Email - Using Input component (light mode on white bg) */}
          <Input
            type="email"
            label="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            error={errors.email}
          />

          {/* Password - Using PasswordInput component */}
          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="At least 8 characters"
            error={errors.password}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />
        </div>

        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-neutral-600 hover:text-neutral-800"
          >
            ← Back
          </Button>
          <Button
            variant="secondary"
            onClick={handleContinue}
          >
            Continue →
          </Button>
        </div>
      </div>
    </SignupLayout>
  );
}
