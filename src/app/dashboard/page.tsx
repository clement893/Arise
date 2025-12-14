'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FeedbackBanner from '@/components/dashboard/FeedbackBanner';
import ProgressCard from '@/components/dashboard/ProgressCard';
import EvaluationCard from '@/components/dashboard/EvaluationCard';
import CoachingCTA from '@/components/dashboard/CoachingCTA';
import { Brain, Users, MessageSquare, Heart, Upload } from 'lucide-react';
import { LoadingPage, Button } from '@/components/ui';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  plan?: string;
}

interface AssessmentSummary {
  tki: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  wellness: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  self_360: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  mbti: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  completedCount: number;
  totalAssessments: number;
  overallProgress: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);
  const [uploadingMBTI, setUploadingMBTI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchAssessments(userData.id);
      } catch {
        // User will be handled by layout
      }
    }
    setLoading(false);
  }, []);

  const fetchAssessments = async (userId: number) => {
    try {
      const accessToken = localStorage.getItem('arise_access_token');
      const response = await fetch('/api/assessments', {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAssessmentSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const handleMBTIUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploadingMBTI(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const accessToken = localStorage.getItem('arise_access_token');
      const response = await fetch('/api/assessments/mbti-upload', {
        method: 'POST',
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully imported MBTI type: ${data.mbtiType}`);
        // Refresh assessment results
        if (user) {
          await fetchAssessments(user.id);
        }
      } else {
        alert(data.error || 'Failed to upload MBTI PDF');
      }
    } catch (error) {
      console.error('Error uploading MBTI PDF:', error);
      alert('Failed to upload MBTI PDF. Please try again.');
    } finally {
      setUploadingMBTI(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const getAssessmentStatus = (type: 'tki' | 'wellness' | 'self_360' | 'mbti') => {
    if (!assessmentSummary) return 'not_started';
    const result = assessmentSummary[type];
    // Check if assessment exists and has completedAt or dominantResult/overallScore to ensure it's actually completed
    if (!result) return 'not_started';
    // For TKI, check dominantResult; for wellness check overallScore; for others check dominantResult
    const isCompleted = result.completedAt || 
      (type === 'tki' && result.dominantResult) ||
      (type === 'wellness' && result.overallScore !== undefined) ||
      (type !== 'wellness' && result.dominantResult);
    return isCompleted ? 'completed' : 'not_started';
  };

  const getProgressPercentage = (type: 'tki' | 'wellness' | 'self_360' | 'mbti') => {
    if (!assessmentSummary) return 0;
    const result = assessmentSummary[type];
    return result ? 100 : 0;
  };

  const progressItems = [
    { label: 'MBTI', percentage: getProgressPercentage('mbti') },
    { label: 'TKI', percentage: getProgressPercentage('tki') },
    { label: '360° Feedback', percentage: getProgressPercentage('self_360') },
    { label: 'Wellness', percentage: getProgressPercentage('wellness'), showAdd: getProgressPercentage('wellness') === 0 },
  ];

  const totalProgress = assessmentSummary?.overallProgress || 0;

  const getTKIResult = () => {
    if (assessmentSummary?.tki) {
      return `Style: ${assessmentSummary.tki.dominantResult}`;
    }
    return 'Explore Your Conflict Management Approach';
  };

  const getWellnessResult = () => {
    if (assessmentSummary?.wellness) {
      return `Light Score: ${assessmentSummary.wellness.overallScore}%`;
    }
    return 'Assess Your Holistic Well-Being';
  };

  const get360Result = () => {
    if (assessmentSummary?.self_360) {
      return `Self Rating: ${assessmentSummary.self_360.dominantResult}`;
    }
    return 'Multi-Faceted Leadership Perspectives';
  };

  return (
    <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome <span className="text-primary-500">{user.firstName || 'User'}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Continue your journey to authentic leadership</p>
        </div>

        {/* Feedback Banner */}
        <div className="mb-6">
          <FeedbackBanner onAddEvaluators={() => router.push('/dashboard/360-evaluators')} />
        </div>

        {/* Progress Card */}
        <div className="mb-8">
          <ProgressCard totalProgress={totalProgress} items={progressItems} />
        </div>

        {/* Your Evaluations */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Your evaluations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <EvaluationCard
                icon={<Brain className="w-6 h-6" />}
                title="MBTI Personality"
                description="Understanding your natural preferences"
                status={getAssessmentStatus('mbti')}
                badge="External link"
                badgeColor="bg-gray-100 text-gray-600"
                onAction={() => {
                  // MBTI is external, could link to external site or show coming soon
                  window.open('https://www.16personalities.com/', '_blank');
                }}
              />
              <div className="absolute bottom-2 right-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleMBTIUpload}
                  className="hidden"
                  id="mbti-upload-input-dashboard"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMBTI}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {uploadingMBTI ? 'Uploading...' : 'Upload PDF'}
                </Button>
              </div>
            </div>
            <EvaluationCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="TKI Conflict Style"
              description={getTKIResult()}
              status={getAssessmentStatus('tki')}
              badge="ARISE Platform"
              badgeColor="bg-primary-500/10 text-primary-500"
              onAction={() => {
                if (getAssessmentStatus('tki') === 'completed') {
                  router.push('/dashboard/results/tki');
                } else {
                  router.push('/dashboard/tki');
                }
              }}
            />
            <EvaluationCard
              icon={<Users className="w-6 h-6" />}
              title="360° Feedback"
              description={get360Result()}
              status={getAssessmentStatus('self_360')}
              badge="ARISE Platform"
              badgeColor="bg-primary-500/10 text-primary-500"
              onAction={() => {
                if (getAssessmentStatus('self_360') === 'completed') {
                  router.push('/dashboard/results');
                } else {
                  router.push('/dashboard/360-self');
                }
              }}
            />
            <EvaluationCard
              icon={<Heart className="w-6 h-6" />}
              title="Wellness"
              description={getWellnessResult()}
              status={getAssessmentStatus('wellness')}
              onAction={() => {
                if (getAssessmentStatus('wellness') === 'completed') {
                  router.push('/dashboard/results');
                } else {
                  router.push('/dashboard/wellness');
                }
              }}
            />
          </div>
        </div>

        {/* Coaching CTA */}
        <CoachingCTA />
    </main>
  );
}
