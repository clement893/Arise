'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { Brain, Users, MessageSquare, Heart, Info, ExternalLink } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface AssessmentResult {
  mbti?: { dominantResult: string; completedAt: string };
  tki?: { dominantResult: string; completedAt: string };
  self_360?: { dominantResult: string; completedAt: string };
  wellness?: { overallScore: number; completedAt: string };
}

interface Assessment {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'not-started';
  tags: { label: string; type: 'external' | 'platform' | 'info' }[];
  actionLabel: string;
  actionType: 'view' | 'continue' | 'review' | 'add' | 'start';
  hasEvaluatorNotice?: boolean;
  route?: string;
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAssessmentResults(parsedUser.id);
    } else {
      router.push('/login');
    }
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

  // Determine assessment status based on actual data
  const getAssessmentStatus = (assessmentId: string): 'completed' | 'in-progress' | 'not-started' => {
    if (!assessmentResults) return 'not-started';
    
    switch (assessmentId) {
      case 'mbti':
        return assessmentResults.mbti?.dominantResult ? 'completed' : 'not-started';
      case 'tki':
        return assessmentResults.tki?.dominantResult ? 'completed' : 'not-started';
      case '360-feedback':
        return assessmentResults.self_360?.dominantResult ? 'completed' : 'not-started';
      case 'wellness':
        return assessmentResults.wellness?.overallScore !== undefined ? 'completed' : 'not-started';
      default:
        return 'not-started';
    }
  };

  // Determine action label based on status
  const getActionLabel = (assessmentId: string, status: 'completed' | 'in-progress' | 'not-started'): string => {
    if (status === 'completed') {
      switch (assessmentId) {
        case 'mbti':
          return 'View results';
        case 'tki':
          return 'Review';
        case '360-feedback':
          return 'View results';
        case 'wellness':
          return 'View results';
        default:
          return 'View';
      }
    }
    return 'Start';
  };

  // Determine action type based on status
  const getActionType = (status: 'completed' | 'in-progress' | 'not-started'): 'view' | 'continue' | 'review' | 'add' | 'start' => {
    if (status === 'completed') return 'view';
    return 'start';
  };

  // Build assessments array dynamically based on actual results
  const buildAssessments = (): Assessment[] => {
    const mbtiStatus = getAssessmentStatus('mbti');
    const tkiStatus = getAssessmentStatus('tki');
    const feedbackStatus = getAssessmentStatus('360-feedback');
    const wellnessStatus = getAssessmentStatus('wellness');

    return [
      {
        id: 'mbti',
        name: 'MBTI Personality',
        description: 'Understanding your natural preferences',
        icon: <Brain className="w-6 h-6 text-[#0D5C5C]" />,
        status: mbtiStatus,
        tags: [
          { label: 'External link', type: 'external' },
        ],
        actionLabel: getActionLabel('mbti', mbtiStatus),
        actionType: getActionType(mbtiStatus),
        route: mbtiStatus === 'completed' ? '/dashboard/results' : 'https://www.16personalities.com/free-personality-test',
      },
      {
        id: 'tki',
        name: 'TKI Conflict Style',
        description: 'Explore your conflict management approach',
        icon: <MessageSquare className="w-6 h-6 text-[#0D5C5C]" />,
        status: tkiStatus,
        tags: [
          { label: 'ARISE Platform', type: 'platform' },
        ],
        actionLabel: getActionLabel('tki', tkiStatus),
        actionType: getActionType(tkiStatus),
        route: tkiStatus === 'completed' ? '/dashboard/results' : '/dashboard/tki',
      },
      {
        id: '360-feedback',
        name: '360° Feedback',
        description: 'Multi-faceted leadership perspectives',
        icon: <Users className="w-6 h-6 text-[#0D5C5C]" />,
        status: feedbackStatus,
        tags: [
          { label: 'ARISE Platform', type: 'platform' },
        ],
        actionLabel: getActionLabel('360-feedback', feedbackStatus),
        actionType: getActionType(feedbackStatus),
        hasEvaluatorNotice: feedbackStatus === 'not-started',
        route: feedbackStatus === 'completed' ? '/dashboard/results' : '/dashboard/360-self',
      },
      {
        id: 'wellness',
        name: 'Wellness',
        description: 'Assess your holistic Well-Being',
        icon: <Heart className="w-6 h-6 text-[#0D5C5C]" />,
        status: wellnessStatus,
        tags: [
          { label: 'ARISE Platform', type: 'platform' },
        ],
        actionLabel: getActionLabel('wellness', wellnessStatus),
        actionType: getActionType(wellnessStatus),
        route: wellnessStatus === 'completed' ? '/dashboard/wellness/results' : '/dashboard/wellness',
      },
    ];
  };

  const assessments = buildAssessments();

  const getStatusBadge = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D5C5C] text-white">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#D4A84B] text-white">
            In progress
          </span>
        );
      case 'not-started':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
            Not Started
          </span>
        );
    }
  };

  const getTagBadge = (tag: Assessment['tags'][0]) => {
    switch (tag.type) {
      case 'external':
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-600 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {tag.label}
          </span>
        );
      case 'platform':
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D5C5C]/10 text-[#0D5C5C]">
            {tag.label}
          </span>
        );
      default:
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {tag.label}
          </span>
        );
    }
  };

  const handleAssessmentAction = (assessment: Assessment) => {
    if (assessment.route) {
      if (assessment.route.startsWith('http')) {
        // External link - open in new tab
        window.open(assessment.route, '_blank');
      } else {
        // Internal route
        router.push(assessment.route);
      }
    }
  };

  const getActionButton = (assessment: Assessment) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
    
    const handleClick = () => handleAssessmentAction(assessment);

    switch (assessment.status) {
      case 'completed':
        return (
          <button 
            onClick={handleClick}
            className={`${baseClasses} border border-[#0D5C5C] text-[#0D5C5C] hover:bg-[#0D5C5C] hover:text-white`}
          >
            {assessment.actionLabel}
          </button>
        );
      case 'in-progress':
        return (
          <button 
            onClick={handleClick}
            className={`${baseClasses} bg-[#0D5C5C] text-white hover:bg-[#0a4a4a]`}
          >
            Continue
          </button>
        );
      case 'not-started':
        return (
          <button 
            onClick={handleClick}
            className={`${baseClasses} bg-[#D4A84B] text-white hover:bg-[#c49a42]`}
          >
            Start
          </button>
        );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
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

  // Check if all assessments are completed
  const allCompleted = assessments.every(a => a.status === 'completed');
  const completedCount = assessments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0D5C5C]">Your assessments</h1>
            <p className="text-gray-600">Track and manage your leadership assessments</p>
            <p className="text-sm text-gray-500 mt-2">
              {completedCount} of {assessments.length} assessments completed
            </p>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id}>
                {/* Assessment Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {assessment.icon}
                      </div>
                      
                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-gray-900">{assessment.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{assessment.description}</p>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-2 mt-3">
                          {getStatusBadge(assessment.status)}
                          {assessment.tags.map((tag) => getTagBadge(tag))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {getActionButton(assessment)}
                    </div>
                  </div>
                </div>

                {/* Evaluator Notice (for 360° Feedback when not started) */}
                {assessment.hasEvaluatorNotice && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Add your evaluators before starting this assessment.
                      </span>
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/360-self')}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* CTA Card - Only show if not all assessments are completed */}
            {!allCompleted && (
              <div className="bg-[#0D5C5C] rounded-xl p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-white text-lg mb-2">Complete your assessments</h3>
                  <p className="text-sm text-white/70 mb-4">
                    Complete all assessments to unlock your full leadership profile and personalized development plan.
                  </p>
                  <button 
                    onClick={() => {
                      const firstIncomplete = assessments.find(a => a.status !== 'completed');
                      if (firstIncomplete) handleAssessmentAction(firstIncomplete);
                    }}
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-[#D4A84B] text-white hover:bg-[#c49a42] transition-colors"
                  >
                    Continue assessments
                  </button>
                </div>
              </div>
            )}

            {/* Success Card - Show when all assessments are completed */}
            {allCompleted && (
              <div className="bg-[#0D5C5C] rounded-xl p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-white text-lg mb-2">All assessments completed!</h3>
                  <p className="text-sm text-white/70 mb-4">
                    View your comprehensive results and personalized development plan.
                  </p>
                  <button 
                    onClick={() => router.push('/dashboard/results')}
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-[#D4A84B] text-white hover:bg-[#c49a42] transition-colors"
                  >
                    View results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
