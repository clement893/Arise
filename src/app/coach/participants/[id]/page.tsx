'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  FileText
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  Card,
  LoadingInline,
  Tabs,
} from '@/components/ui';
import { api } from '@/lib/api-client';

interface Assessment {
  id: number;
  assessmentType: string;
  answers: any;
  scores: any;
  dominantResult: string | null;
  overallScore: number | null;
  completedAt: string | null;
  createdAt: string;
}

interface Participant {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  createdAt: string;
  hasCoach: boolean | null;
  assessments: Assessment[];
}

export default function ParticipantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const participantId = params?.id as string;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (participantId) {
      loadParticipant();
    }
  }, [participantId]);

  const loadParticipant = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await api.get(`/api/coach/participants/${participantId}`);
      
      if (response.ok) {
        const data = await response.json();
        setParticipant(data.participant);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || `Failed to load participant (${response.status})`);
      }
    } catch (error) {
      console.error('Error loading participant:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load participant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCoach = async (assign: boolean) => {
    if (!participant) return;

    try {
      const response = await api.put(`/api/coach/participants/${participant.id}`, {
        hasCoach: assign,
      });

      if (response.ok) {
        const data = await response.json();
        setParticipant({ ...participant, hasCoach: data.participant.hasCoach });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update participant');
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Failed to update participant');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingInline />
        </div>
      </div>
    );
  }

  if (loadError || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{loadError || 'Participant not found'}</p>
              <Button onClick={() => router.push('/coach/participants')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Participants
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const completedAssessments = participant.assessments.filter(a => a.completedAt !== null);
  const averageScore = completedAssessments.length > 0
    ? Math.round(
        completedAssessments
          .filter(a => a.overallScore !== null)
          .reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/coach/participants')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Participants
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {participant.firstName || participant.lastName
                  ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
                  : participant.email}
              </h1>
              <p className="text-gray-600">{participant.email}</p>
            </div>
            <div className="flex items-center gap-4">
              {participant.hasCoach ? (
                <Badge variant="success" className="text-sm">Has Coach</Badge>
              ) : (
                <Badge variant="secondary" className="text-sm">No Coach</Badge>
              )}
              <Badge variant="neutral" outline>{participant.plan}</Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Assessments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedAssessments.length} / {participant.assessments.length}
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageScore > 0 ? `${averageScore}%` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(participant.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'assessments', label: `Assessments (${participant.assessments.length})` },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Participant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Name</span>
                </div>
                <p className="text-gray-900">
                  {participant.firstName || participant.lastName
                    ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-gray-900">{participant.email}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Plan</span>
                </div>
                <Badge variant="neutral" outline>{participant.plan}</Badge>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Member Since</span>
                </div>
                <p className="text-gray-900">
                  {new Date(participant.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {participant.assessments.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No assessments yet</p>
              </Card>
            ) : (
              participant.assessments.map((assessment) => (
                <Card key={assessment.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {assessment.assessmentType.replace('_', ' ')}
                      </h3>
                      {assessment.completedAt && (
                        <p className="text-sm text-gray-600 mt-1">
                          Completed: {new Date(assessment.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {assessment.completedAt ? (
                        <Badge variant="completed">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                      {assessment.overallScore !== null && (
                        <Badge variant="neutral" outline>{assessment.overallScore}%</Badge>
                      )}
                    </div>
                  </div>
                  {assessment.dominantResult && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Dominant Result:</p>
                      <p className="text-lg font-medium text-gray-900">{assessment.dominantResult}</p>
                    </div>
                  )}
                  {assessment.scores && typeof assessment.scores === 'object' && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Scores:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(assessment.scores).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600 capitalize">{key}</p>
                            <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

