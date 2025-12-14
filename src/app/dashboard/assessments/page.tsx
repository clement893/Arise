'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Users, MessageSquare, Heart, Info, ExternalLink } from 'lucide-react';
import { Button, Badge, Card, LoadingPage } from '@/components/ui';

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
    const loadData = async () => {
      const userData = localStorage.getItem('arise_user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          await fetchAssessmentResults(parsedUser.id);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };
    loadData();
  }, [router]);

  const fetchAssessmentResults = async (userId: number) => {
    try {
      const accessToken = localStorage.getItem('arise_access_token');
      const response = await fetch('/api/assessments', {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
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

  const getActionLabel = (assessmentId: string, status: 'completed' | 'in-progress' | 'not-started'): string => {
    if (status === 'completed') {
      switch (assessmentId) {
        case 'mbti':
        case '360-feedback':
        case 'wellness':
          return 'View results';
        case 'tki':
          return 'Review';
        default:
          return 'View';
      }
    }
    return 'Start';
  };

  const getActionType = (status: 'completed' | 'in-progress' | 'not-started'): 'view' | 'continue' | 'review' | 'add' | 'start' => {
    if (status === 'completed') return 'view';
    return 'start';
  };

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
        icon: <Brain className="w-6 h-6 text-primary-500" />,
        status: mbtiStatus,
        tags: [{ label: 'External link', type: 'external' }],
        actionLabel: getActionLabel('mbti', mbtiStatus),
        actionType: getActionType(mbtiStatus),
        route: mbtiStatus === 'completed' ? '/dashboard/results' : 'https://www.16personalities.com/free-personality-test',
      },
      {
        id: 'tki',
        name: 'TKI Conflict Style',
        description: 'Explore your conflict management approach',
        icon: <MessageSquare className="w-6 h-6 text-primary-500" />,
        status: tkiStatus,
        tags: [{ label: 'ARISE Platform', type: 'platform' }],
        actionLabel: getActionLabel('tki', tkiStatus),
        actionType: getActionType(tkiStatus),
        route: tkiStatus === 'completed' ? '/dashboard/results/tki' : '/dashboard/tki',
      },
      {
        id: '360-feedback',
        name: '360° Feedback',
        description: 'Multi-faceted leadership perspectives',
        icon: <Users className="w-6 h-6 text-primary-500" />,
        status: feedbackStatus,
        tags: [{ label: 'ARISE Platform', type: 'platform' }],
        actionLabel: getActionLabel('360-feedback', feedbackStatus),
        actionType: getActionType(feedbackStatus),
        hasEvaluatorNotice: feedbackStatus === 'not-started',
        route: feedbackStatus === 'completed' ? '/dashboard/results' : '/dashboard/360-self',
      },
      {
        id: 'wellness',
        name: 'Wellness',
        description: 'Assess your holistic Well-Being',
        icon: <Heart className="w-6 h-6 text-primary-500" />,
        status: wellnessStatus,
        tags: [{ label: 'ARISE Platform', type: 'platform' }],
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
        return <Badge variant="success">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In progress</Badge>;
      case 'not-started':
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  const getTagBadge = (tag: Assessment['tags'][0]) => {
    switch (tag.type) {
      case 'external':
        return (
          <Badge key={tag.label} variant="neutral" className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {tag.label}
          </Badge>
        );
      case 'platform':
        return <Badge key={tag.label} variant="primary">{tag.label}</Badge>;
      default:
        return <Badge key={tag.label} variant="neutral">{tag.label}</Badge>;
    }
  };

  const handleAssessmentAction = (assessment: Assessment) => {
    if (assessment.route) {
      if (assessment.route.startsWith('http')) {
        window.open(assessment.route, '_blank');
      } else {
        router.push(assessment.route);
      }
    }
  };

  const getActionButton = (assessment: Assessment) => {
    const handleClick = () => handleAssessmentAction(assessment);

    switch (assessment.status) {
      case 'completed':
        return (
          <Button variant="outline" onClick={handleClick}>
            {assessment.actionLabel}
          </Button>
        );
      case 'in-progress':
        return (
          <Button variant="primary" onClick={handleClick}>
            Continue
          </Button>
        );
      case 'not-started':
        return (
          <Button variant="secondary" onClick={handleClick}>
            Start
          </Button>
        );
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const completedCount = assessments.filter(a => a.status === 'completed').length;

  return (
    <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary-500">Your assessments</h1>
            <p className="text-gray-600">Track and manage your leadership assessments</p>
            <p className="text-sm text-gray-500 mt-2">
              {completedCount} of {assessments.length} assessments completed
            </p>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id}>
                <Card>
                  <div className="flex items-start justify-between p-6">
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
                </Card>

                {/* Evaluator Notice */}
                {assessment.hasEvaluatorNotice && (
                  <Card className="mt-2 bg-gray-50 border border-gray-200">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Add evaluators</p>
                          <p className="text-xs text-gray-500">Invite colleagues for 360° feedback</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/dashboard/360-evaluators')}
                      >
                        + Add evaluators
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
  );
}
