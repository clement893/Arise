'use client';

/**
 * Complete Profile Page
 * 
 * Step 6 of signup flow - user completes their profile information.
 * Uses light mode inputs on white background.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';
import { Button, Input, Select } from '@/components/ui';

export default function CompleteProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phone: '',
    timezone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Get all signup data from localStorage
      const email = localStorage.getItem('signupEmail') || '';
      const password = localStorage.getItem('signupPassword') || '';
      const userType = localStorage.getItem('signupUserType') || 'individual';
      const plan = localStorage.getItem('signupPlan') || 'starter';
      const billingCycle = localStorage.getItem('signupBillingCycle') || 'monthly';

      // Create user via API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company || null,
          jobTitle: formData.jobTitle || null,
          phone: formData.phone || null,
          timezone: formData.timezone || null,
          userType,
          plan,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Clear localStorage
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupPassword');
      localStorage.removeItem('signupUserType');
      localStorage.removeItem('signupPlan');
      localStorage.removeItem('signupBillingCycle');
      
      // Store user data for welcome page and dashboard
      localStorage.setItem('signupFirstName', formData.firstName);
      localStorage.setItem('signupLastName', formData.lastName);
      
      // Store user for dashboard
      localStorage.setItem('arise_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        plan: data.user.plan,
        userType: data.user.userType,
      }));

      router.push('/signup/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Timezone options for Select component
  const timezoneOptions = [
    { value: '', label: 'Select your timezone' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Toronto', label: 'Toronto (ET)' },
    { value: 'America/Montreal', label: 'Montreal (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
  ];

  return (
    <SignupLayout currentStep={6}>
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
            Complete your profile
          </h1>
          <p className="text-neutral-600">
            Tell us a bit about yourself
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              error={errors.firstName}
              required
            />
            <Input
              label="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              error={errors.lastName}
              required
            />
          </div>

          {/* Company */}
          <Input
            label="Company / Organization"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Your company name"
          />

          {/* Job Title */}
          <Input
            label="Job title"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="Your role"
          />

          {/* Phone */}
          <Input
            type="tel"
            label="Phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />

          {/* Timezone */}
          <Select
            label="Timezone"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            options={timezoneOptions}
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
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Continue →'}
          </Button>
        </div>
      </div>
    </SignupLayout>
  );
}
