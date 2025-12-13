'use client';

import { Button, Card, CardContent, Badge, LoadingPage } from '@/components/ui';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Camera, Loader2 } from 'lucide-react';
import SubscriptionTab from './SubscriptionTab';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  billingCycle: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  timezone?: string;
  gender?: string;
  age?: number;
  highestDegree?: string;
  mainGoal?: string;
  hasCoach?: boolean;
  employeeCount?: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
  gender: string;
  age: string;
  highestDegree: string;
  mainGoal: string;
  hasCoach: string;
  organizationName: string;
  employeeCount: string;
}

interface Subscription {
  plan: string;
  billingCycle: string;
  status: string;
  price: number;
  currency: string;
  hasCoaching: boolean;
  coachingSessions: number;
  startDate?: string;
  endDate?: string;
  nextBillingDate?: string;
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>(
    tabParam === 'subscription' ? 'subscription' : 'profile'
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '••••••••',
    timezone: '',
    gender: '',
    age: '',
    highestDegree: '',
    mainGoal: '',
    hasCoach: '',
    organizationName: '',
    employeeCount: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('arise_user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Essayer de charger les données depuis l'API
      try {
        const accessToken = localStorage.getItem('arise_access_token');
        const response = await fetch('/api/user/profile', {
          headers: {
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const apiUser = data.user;
          setUser(apiUser);
          setProfileData({
            firstName: apiUser.firstName || '',
            lastName: apiUser.lastName || '',
            email: apiUser.email || '',
            password: '••••••••',
            timezone: apiUser.timezone || 'America/New_York',
            gender: apiUser.gender || '',
            age: apiUser.age?.toString() || '',
            highestDegree: apiUser.highestDegree || '',
            mainGoal: apiUser.mainGoal || '',
            hasCoach: apiUser.hasCoach === true ? 'Yes' : apiUser.hasCoach === false ? 'No' : '',
            organizationName: apiUser.company || '',
            employeeCount: apiUser.employeeCount || '',
          });
          // Mettre à jour localStorage avec les données fraîches
          localStorage.setItem('arise_user', JSON.stringify(apiUser));
        } else {
          // Utiliser les données du localStorage si l'API échoue
          setProfileData({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            password: '••••••••',
            timezone: parsedUser.timezone || 'America/New_York',
            gender: parsedUser.gender || '',
            age: parsedUser.age?.toString() || '',
            highestDegree: parsedUser.highestDegree || '',
            mainGoal: parsedUser.mainGoal || '',
            hasCoach: parsedUser.hasCoach === true ? 'Yes' : parsedUser.hasCoach === false ? 'No' : '',
            organizationName: parsedUser.company || '',
            employeeCount: parsedUser.employeeCount || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile from API:', error);
        setProfileData({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
          password: '••••••••',
          timezone: parsedUser.timezone || 'America/New_York',
          gender: '',
          age: '',
          highestDegree: '',
          mainGoal: '',
          hasCoach: '',
          organizationName: parsedUser.company || '',
          employeeCount: '',
        });
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [router]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const accessToken = localStorage.getItem('arise_access_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          company: profileData.organizationName,
          timezone: profileData.timezone,
          gender: profileData.gender,
          age: profileData.age,
          highestDegree: profileData.highestDegree,
          mainGoal: profileData.mainGoal,
          hasCoach: profileData.hasCoach,
          employeeCount: profileData.employeeCount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('arise_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your personal information and account settings</p>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {saveMessage.text}
            </div>
          )}

          {/* Tabs */}
          <Card className="p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 sm:px-8 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`px-6 sm:px-8 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'subscription'
                      ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Subscription
                </button>
              </div>
              {activeTab === 'profile' && (
                <div className="flex-1 flex justify-end items-center px-4 sm:pr-6 py-2 sm:py-0">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 sm:px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'profile' ? (
                <div>
                  {/* Profile Photo */}
                  <div className="flex items-center gap-4 mb-8 p-5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-sm">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md">
                        <span className="text-primary-500 font-bold text-2xl sm:text-3xl">
                          {profileData.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary-500 rounded-full flex items-center justify-center shadow-md hover:bg-secondary-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg sm:text-xl">{profileData.firstName} {profileData.lastName}</h3>
                      <button className="text-secondary-300 text-sm hover:text-secondary-200 transition-colors">Change photo</button>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <section className="mb-8">
                    <div className="mb-5 pb-3 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Personal Information</h2>
                      <p className="text-sm text-gray-500">Your basic account details and contact information</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter your first name"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used for account login and notifications</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input
                          type="password"
                          value={profileData.password}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Password changes are managed separately</p>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                        <div className="relative">
                          <select
                            value={profileData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for scheduling and time-based features</p>
                      </div>
                    </div>
                  </section>

                  {/* Additional Information */}
                  <section className="mb-8">
                    <div className="mb-5 pb-3 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Additional Information</h2>
                      <p className="text-sm text-gray-500">Help us personalize your leadership development experience</p>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <div className="flex flex-wrap gap-4">
                        {['Male', 'Female', 'Other'].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={profileData.gender === option}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                        <input
                          type="number"
                          placeholder="e.g., 35"
                          value={profileData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Highest Degree Attained</label>
                        <div className="relative">
                          <select
                            value={profileData.highestDegree}
                            onChange={(e) => handleInputChange('highestDegree', e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                          >
                            <option value="">Select your education level</option>
                            <option value="high_school">High School</option>
                            <option value="bachelor">Bachelor&apos;s Degree</option>
                            <option value="master">Master&apos;s Degree</option>
                            <option value="doctorate">Doctorate</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        What is your main goal with a leadership development plan?
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Improve team communication, develop strategic thinking..."
                        value={profileData.mainGoal}
                        onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">This helps us tailor your development recommendations</p>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Have you ever worked with a leadership coach?
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {['Yes', 'No'].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="hasCoach"
                              value={option}
                              checked={profileData.hasCoach === option}
                              onChange={(e) => handleInputChange('hasCoach', e.target.value)}
                              className="w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Company Information */}
                  <section>
                    <div className="mb-5 pb-3 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Company Information</h2>
                      <p className="text-sm text-gray-500">Tell us about your organization</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Acme Corporation"
                          value={profileData.organizationName}
                          onChange={(e) => handleInputChange('organizationName', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Employees</label>
                        <input
                          type="text"
                          placeholder="e.g., 50-100"
                          value={profileData.employeeCount}
                          onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Approximate size of your organization</p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <SubscriptionTab user={user} />
              )}
            </div>
          </Card>
        </div>
    </main>
  );
}

// SubscriptionTab is now imported from ./SubscriptionTab.tsx


export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
