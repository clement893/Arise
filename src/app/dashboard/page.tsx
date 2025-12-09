'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import FeedbackBanner from '@/components/dashboard/FeedbackBanner';
import ProgressCard from '@/components/dashboard/ProgressCard';
import EvaluationCard from '@/components/dashboard/EvaluationCard';
import CoachingCTA from '@/components/dashboard/CoachingCTA';
import { Brain, Users, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  plan?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage (from signup flow)
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        // Invalid data, redirect to login
        router.push('/signup');
      }
    } else {
      // No user, redirect to signup
      router.push('/signup');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const progressItems = [
    { label: 'MBTI', percentage: 100 },
    { label: 'TKI', percentage: 100 },
    { label: '360° Feedback', percentage: 40 },
    { label: 'Wellness', percentage: 0, showAdd: true },
  ];

  const totalProgress = 95;

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome <span className="text-[#0D5C5C]">{user.firstName || 'User'}</span>
          </h1>
          <p className="text-gray-600">Continue your journey to authentic leadership</p>
        </div>

        {/* Feedback Banner */}
        <div className="mb-6">
          <FeedbackBanner onAddEvaluators={() => console.log('Add evaluators')} />
        </div>

        {/* Progress Card */}
        <div className="mb-8">
          <ProgressCard totalProgress={totalProgress} items={progressItems} />
        </div>

        {/* Your Evaluations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your evaluations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EvaluationCard
              icon={<Brain className="w-6 h-6" />}
              title="MBTI Personality"
              description="Understanding your natural preferences"
              status="completed"
              badge="External link"
              badgeColor="bg-gray-100 text-gray-600"
            />
            <EvaluationCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="TKI Conflict Style"
              description="Explore Your Conflict Management Approach"
              status="not_started"
              badge="ARISE Platform"
              badgeColor="bg-[#0D5C5C]/10 text-[#0D5C5C]"
              onAction={() => router.push('/dashboard/tki')}
            />
            <EvaluationCard
              icon={<Users className="w-6 h-6" />}
              title="360° Feedback"
              description="Multi-Faceted Leadership Perspectives"
              status="not_started"
              badge="ARISE Platform"
              badgeColor="bg-[#0D5C5C]/10 text-[#0D5C5C]"
              onAction={() => router.push('/dashboard/360-self')}
            />
            <EvaluationCard
              icon={<Heart className="w-6 h-6" />}
              title="Wellness"
              description="Assess Your Holistic Well-Being"
              status="not_started"
              onAction={() => router.push('/dashboard/wellness')}
            />
          </div>
        </div>

        {/* Coaching CTA */}
        <CoachingCTA />
      </main>
    </div>
  );
}
