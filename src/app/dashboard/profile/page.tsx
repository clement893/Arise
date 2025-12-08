'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { ChevronDown, Camera } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  timezone?: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>(
    tabParam === 'subscription' ? 'subscription' : 'profile'
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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
    const userData = localStorage.getItem('arise_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData((prev) => ({
        ...prev,
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        timezone: parsedUser.timezone || 'America/New_York',
        organizationName: parsedUser.company || '',
      }));
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Update localStorage
    if (user) {
      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        company: profileData.organizationName,
        timezone: profileData.timezone,
      };
      localStorage.setItem('arise_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D5C5C]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D5C5C]">
      {/* Top Bar */}
      <div className="bg-[#0D5C5C] text-white px-6 py-3">
        <span className="text-sm font-medium tracking-wider">PROFILE</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar user={user} activePage="profile" />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 bg-[#0D5C5C]/30 min-h-[calc(100vh-48px)]">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Your profile</h1>
                <p className="text-white/70">Update your profile information & subscription</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-8 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-[#0D5C5C] border-b-2 border-[#0D5C5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`px-8 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'subscription'
                      ? 'text-[#0D5C5C] border-b-2 border-[#0D5C5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Subscription
                </button>
                <div className="flex-1 flex justify-end items-center pr-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#0D5C5C] text-white rounded-lg font-medium hover:bg-[#0a4a4a] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-xl shadow-sm">
              {activeTab === 'profile' ? (
                <div className="p-8">
                  {/* Profile Photo */}
                  <div className="flex items-center gap-4 mb-8 p-4 bg-[#0D5C5C] rounded-lg">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        <span className="text-[#0D5C5C] font-bold text-2xl">
                          {profileData.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4A84B] rounded-full flex items-center justify-center">
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{profileData.firstName} {profileData.lastName}</h3>
                      <button className="text-[#D4A84B] text-sm hover:underline">Change photo</button>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <section className="mb-8">
                    <h2 className="text-[#0D5C5C] font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">First name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Last name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                          type="password"
                          value={profileData.password}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Timezone</label>
                        <div className="relative">
                          <select
                            value={profileData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
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
                      </div>
                    </div>
                  </section>

                  {/* Additional Information */}
                  <section className="mb-8">
                    <h2 className="text-[#0D5C5C] font-semibold mb-4">Additional Information</h2>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-2">Gender</label>
                      <div className="flex gap-4">
                        {['Male', 'Female', 'Other'].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={profileData.gender === option}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="w-4 h-4 text-[#0D5C5C] focus:ring-[#0D5C5C]"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Age</label>
                        <input
                          type="text"
                          placeholder="Enter your age"
                          value={profileData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Highest degree attained</label>
                        <div className="relative">
                          <select
                            value={profileData.highestDegree}
                            onChange={(e) => handleInputChange('highestDegree', e.target.value)}
                            className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                          >
                            <option value="">Select...</option>
                            <option value="high_school">High School</option>
                            <option value="bachelor">Bachelor's Degree</option>
                            <option value="master">Master's Degree</option>
                            <option value="doctorate">Doctorate</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-1">
                        What is your main goal with a leadership development plan?
                      </label>
                      <input
                        type="text"
                        placeholder="Write..."
                        value={profileData.mainGoal}
                        onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-2">
                        Have you ever worked with a leadership coach?
                      </label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasCoach"
                              value={option}
                              checked={profileData.hasCoach === option}
                              onChange={(e) => handleInputChange('hasCoach', e.target.value)}
                              className="w-4 h-4 text-[#0D5C5C] focus:ring-[#0D5C5C]"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Company Information */}
                  <section>
                    <h2 className="text-[#0D5C5C] font-semibold mb-4">Company Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Organization name</label>
                        <input
                          type="text"
                          placeholder="Organization"
                          value={profileData.organizationName}
                          onChange={(e) => handleInputChange('organizationName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Number</label>
                        <input
                          type="text"
                          placeholder="Number"
                          value={profileData.employeeCount}
                          onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <SubscriptionTab user={user} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SubscriptionTab({ user }: { user: User }) {
  return (
    <div className="p-8">
      {/* Current Plan */}
      <section className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-4">Current plan</h2>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[#0D5C5C] font-bold text-lg">REVELATION</h3>
              <p className="text-sm text-gray-500">Full suite of assessments - billed on 11/10/2025</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">$299</span>
              <span className="text-gray-500">/year</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-[#0D5C5C] text-white text-xs rounded-full">Professional</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">360 Feedback</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Wellness Plan</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Development Plan</span>
          </div>
        </div>
      </section>

      {/* Upgrade Your Plan */}
      <section className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-4">Upgrade Your Plan</h2>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="plan"
                className="w-5 h-5 text-[#0D5C5C] focus:ring-[#0D5C5C]"
              />
              <div>
                <h3 className="font-semibold text-gray-900">COACHING</h3>
                <p className="text-sm text-gray-500">Add 3 coaching sessions and a full final coach</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-gray-500 text-xs">Coach</span>
              </div>
              <button className="px-4 py-2 bg-[#D4A84B] text-white rounded-lg font-medium hover:bg-[#c49a42] transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching CTA */}
      <section className="bg-[#0D5C5C] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Ready to accelerate your growth?</h2>
            <p className="text-white/80 mb-4">
              Connect with expert ARISE coaches who specialize in leadership development. 
              Schedule your FREE coaching session to debrief your results and build a personalized development plan.
            </p>
            <Link
              href="/coaching"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A84B] text-[#0D5C5C] rounded-lg font-semibold hover:bg-[#c49a42] transition-colors"
            >
              Explore coaching options →
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#D4A84B] flex items-center justify-center">
              <span className="text-[#0D5C5C] text-2xl">👤</span>
            </div>
            <div className="w-32 h-32 rounded-lg bg-gray-300 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
