'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';

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
      
      // Store first name for welcome page
      localStorage.setItem('signupFirstName', formData.firstName);
      localStorage.setItem('signupLastName', formData.lastName);

      router.push('/signup/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout currentStep={6}>
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-4">
            Complete your profile
          </h1>
          <p className="text-[#2D2D2D]/60">
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
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#2D2D2D] mb-2">
                First name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#2D2D2D] mb-2">
                Last name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-[#2D2D2D] mb-2">
              Company / Organization
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
              placeholder="Your company name"
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-[#2D2D2D] mb-2">
              Job title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
              placeholder="Your role"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#2D2D2D] mb-2">
              Phone number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-[#2D2D2D] mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent bg-white"
            >
              <option value="">Select your timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Toronto">Toronto (ET)</option>
              <option value="America/Montreal">Montreal (ET)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="text-[#2D2D2D]/60 hover:text-[#2D2D2D] font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="bg-[#D4A84B] hover:bg-[#C49A3D] text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Continue →'}
          </button>
        </div>
      </div>
    </SignupLayout>
  );
}
