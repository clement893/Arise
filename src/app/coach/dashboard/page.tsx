'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  Eye,
  BarChart3
} from 'lucide-react';
import { 
  Button, 
  StatCard, 
  Badge, 
  Input,
  Card,
  LoadingInline,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { api } from '@/lib/api-client';

interface Stats {
  totalParticipants: number;
  participantsWithCoach: number;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  assessmentsByType: Record<string, number>;
}

interface Participant {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  createdAt: string;
  hasCoach: boolean | null;
}

export default function CoachDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    participantsWithCoach: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    assessmentsByType: {},
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await api.get('/api/coach/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          totalParticipants: 0,
          participantsWithCoach: 0,
          totalAssessments: 0,
          completedAssessments: 0,
          averageScore: 0,
          assessmentsByType: {},
        });
        setParticipants(data.participants || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || `Failed to load data (${response.status})`);
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load coach data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingInline />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
          <p className="text-gray-600">Overview of your participants and their progress</p>
        </div>

        {/* Error Banner */}
        {loadError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-900">Error loading data</h3>
                <p className="text-sm text-red-800 mt-1">{loadError}</p>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            icon={<Users className="w-6 h-6" />}
            variant="blue"
          />
          <StatCard
            title="With Coach"
            value={stats.participantsWithCoach}
            icon={<UserCheck className="w-6 h-6" />}
            variant="green"
          />
          <StatCard
            title="Completed Assessments"
            value={stats.completedAssessments}
            icon={<ClipboardCheck className="w-6 h-6" />}
            variant="purple"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="teal"
          />
        </div>

        {/* Recent Participants */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Participants</h2>
              <Button
                onClick={() => router.push('/coach/participants')}
                variant="outline"
              >
                View All
              </Button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No participants yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        {participant.firstName || participant.lastName
                          ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>
                        <Badge variant="neutral" outline>{participant.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        {participant.hasCoach ? (
                          <Badge variant="success">Has Coach</Badge>
                        ) : (
                          <Badge variant="secondary">No Coach</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => router.push(`/coach/participants/${participant.id}`)}
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Assessment Types Breakdown */}
        {Object.keys(stats.assessmentsByType).length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Assessments by Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.assessmentsByType).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 capitalize">{type}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

