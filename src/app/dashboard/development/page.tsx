'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Target, TrendingUp, Calendar, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface AssessmentResults {
  mbti?: { dominantResult: string; completedAt?: string };
  tki?: { dominantResult: string; completedAt?: string };
  self_360?: { dominantResult: string; completedAt?: string };
  wellness?: { overallScore: number; completedAt?: string };
}

// Recommended books (these are static resources, not user data)
const recommendedBooks = [
  {
    id: 1,
    title: 'Dare to Lead',
    author: 'Brené Brown',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    category: 'Leadership',
  },
  {
    id: 2,
    title: 'Crucial Conversations',
    author: 'Patterson, Grenny, et al.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
    category: 'Communication',
  },
  {
    id: 3,
    title: 'The 7 Habits',
    author: 'Stephen Covey',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop',
    category: 'Personal Growth',
  },
  {
    id: 4,
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=300&fit=crop',
    category: 'Self-Awareness',
  },
];

export default function DevelopmentPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchAssessmentResults(parsedUser.id);
    setIsLoading(false);
  }, [router]);

  const fetchAssessmentResults = async (userId: number) => {
    try {
      const response = await fetch('/api/assessments', {
        headers: {
          'x-user-id': userId.toString(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAssessmentResults(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch assessment results:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  // Check if user has completed any assessments
  const hasMBTI = assessmentResults?.mbti?.dominantResult;
  const hasTKI = assessmentResults?.tki?.dominantResult;
  const has360 = assessmentResults?.self_360?.dominantResult;
  const hasWellness = assessmentResults?.wellness?.overallScore !== undefined;
  const hasAnyAssessment = hasMBTI || hasTKI || has360 || hasWellness;
  const completedAssessmentsCount = [hasMBTI, hasTKI, has360, hasWellness].filter(Boolean).length;

  // Build profile scores dynamically based on actual results
  const profileScores = [
    { 
      label: 'MBTI', 
      value: hasMBTI || 'Not completed', 
      color: '#0D5C5C',
      completed: !!hasMBTI 
    },
    { 
      label: 'TKI Dominant', 
      value: hasTKI || 'Not completed', 
      color: '#27ae60',
      completed: !!hasTKI 
    },
    { 
      label: '360° Score', 
      value: has360 || 'Not completed', 
      color: '#9b59b6',
      completed: !!has360 
    },
    { 
      label: 'Light score', 
      value: hasWellness ? `${assessmentResults?.wellness?.overallScore}%` : 'Not completed', 
      color: '#D4A84B',
      completed: !!hasWellness 
    },
  ];

  // Build key updates dynamically based on completed assessments
  const buildKeyUpdates = () => {
    const updates: { id: number; date: string; title: string; description: string; type: string }[] = [];
    let id = 1;

    if (hasMBTI && assessmentResults?.mbti?.completedAt) {
      updates.push({
        id: id++,
        date: assessmentResults.mbti.completedAt,
        title: 'Completed MBTI Assessment',
        description: `Identified as ${hasMBTI}`,
        type: 'achievement',
      });
    }

    if (hasTKI && assessmentResults?.tki?.completedAt) {
      updates.push({
        id: id++,
        date: assessmentResults.tki.completedAt,
        title: 'TKI Results Available',
        description: `Dominant style: ${hasTKI}`,
        type: 'result',
      });
    }

    if (has360 && assessmentResults?.self_360?.completedAt) {
      updates.push({
        id: id++,
        date: assessmentResults.self_360.completedAt,
        title: '360° Feedback Completed',
        description: `Score: ${has360}`,
        type: 'achievement',
      });
    }

    if (hasWellness && assessmentResults?.wellness?.completedAt) {
      updates.push({
        id: id++,
        date: assessmentResults.wellness.completedAt,
        title: 'Wellness Assessment Completed',
        description: `Overall score: ${assessmentResults.wellness.overallScore}%`,
        type: 'achievement',
      });
    }

    return updates;
  };

  const keyUpdates = buildKeyUpdates();

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Development plan & Resources</h1>
                <p className="text-gray-600">Track your growth journey and access learning materials</p>
              </div>
            </div>
            {hasAnyAssessment && (
              <button className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a] transition-colors text-sm font-medium">
                + Add objective
              </button>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Objectives & Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Development Objectives */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#0D5C5C]" />
                    Development Objectives
                  </h2>
                </div>

                {hasAnyAssessment ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No objectives defined yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Based on your assessment results, we recommend defining development objectives with a coach.
                    </p>
                    <button className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a] transition-colors text-sm font-medium">
                      + Add your first objective
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Complete your assessments first</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Your development objectives will be personalized based on your assessment results.
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/assessments')}
                      className="text-[#0D5C5C] text-sm font-medium hover:underline"
                    >
                      Start an assessment →
                    </button>
                  </div>
                )}
              </div>

              {/* Recommended Books */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0D5C5C]" />
                    Recommended Books
                  </h2>
                  <button className="text-sm text-[#0D5C5C] hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {recommendedBooks.map((book) => (
                    <div key={book.id} className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <Image
                          src={book.image}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{book.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Activities */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0D5C5C]" />
                    Growth Activities
                  </h2>
                </div>

                {hasAnyAssessment ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No activities defined yet</p>
                    <p className="text-sm text-gray-400">
                      Activities will be suggested based on your development objectives.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Complete your assessments first</p>
                    <p className="text-sm text-gray-400">
                      Growth activities will be personalized based on your results.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Updates & Profile */}
            <div className="space-y-6">
              {/* Your Global Profile */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your global profile</h2>
                <p className="text-sm text-gray-500 mb-4">{completedAssessmentsCount}/4 assessments completed</p>
                <div className="grid grid-cols-2 gap-3">
                  {profileScores.map((score, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: score.completed ? `${score.color}10` : '#f3f4f6' }}
                    >
                      <p className="text-xs text-gray-600 mb-1">{score.label}</p>
                      <p 
                        className="font-bold text-sm"
                        style={{ color: score.completed ? score.color : '#9ca3af' }}
                      >
                        {score.value}
                      </p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => router.push('/dashboard/results')}
                  className="w-full mt-4 py-2 text-sm text-[#0D5C5C] border border-[#0D5C5C] rounded-lg hover:bg-[#0D5C5C]/5 transition-colors"
                >
                  View full results
                </button>
              </div>

              {/* Key Updates */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key updates</h2>
                
                {keyUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {keyUpdates.map((update, index) => (
                      <div key={update.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            update.type === 'achievement' ? 'bg-green-500' :
                            update.type === 'result' ? 'bg-[#D4A84B]' : 'bg-[#0D5C5C]'
                          }`} />
                          {index < keyUpdates.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <h3 className="text-sm font-medium text-gray-900">{update.title}</h3>
                          <p className="text-xs text-gray-600">{update.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No updates yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete assessments to see your progress
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Card */}
              <div className="bg-[#2D2D2D] rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Ready to accelerate your growth?</h3>
                <p className="text-gray-400 text-sm mb-4">Get personalized coaching to reach your leadership potential</p>
                <button className="w-full py-3 bg-[#D4A84B] text-[#2D2D2D] font-semibold rounded-lg hover:bg-[#c49a42] transition-colors">
                  Book a coaching session
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
