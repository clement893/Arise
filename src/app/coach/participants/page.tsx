'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { 
  Button, 
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
  Tabs,
} from '@/components/ui';
import { api } from '@/lib/api-client';

interface Participant {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  createdAt: string;
  hasCoach: boolean | null;
  assessmentCount: number;
  completedAssessments: number;
  averageScore: number;
}

export default function CoachParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Memoize filtered participants to avoid unnecessary recalculations
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Apply tab filter
    if (activeTab === 'with_coach') {
      filtered = filtered.filter(p => p.hasCoach === true);
    } else if (activeTab === 'without_coach') {
      filtered = filtered.filter(p => p.hasCoach !== true);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.email.toLowerCase().includes(query) ||
        (p.firstName && p.firstName.toLowerCase().includes(query)) ||
        (p.lastName && p.lastName.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [participants, activeTab, searchQuery]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await api.get('/api/coach/participants');
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || `Failed to load participants (${response.status})`);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignCoach = useCallback(async (participantId: number, assign: boolean) => {
    try {
      const response = await api.put(`/api/coach/participants/${participantId}`, {
        hasCoach: assign,
      });

      if (response.ok) {
        // Reload data
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update participant');
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Failed to update participant');
    }
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Participants</h1>
          <p className="text-gray-600">Manage and view all participants</p>
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

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Refresh */}
              <Button
                onClick={loadData}
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <Tabs
                tabs={[
                  { id: 'all', label: `All (${participants.length})` },
                  { id: 'with_coach', label: `With Coach (${participants.filter(p => p.hasCoach).length})`, icon: <UserCheck className="h-4 w-4" /> },
                  { id: 'without_coach', label: `Without Coach (${participants.filter(p => !p.hasCoach).length})`, icon: <UserX className="h-4 w-4" /> },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
              />
            </div>
          </div>
        </Card>

        {/* Participants Table */}
        <Card>
          <div className="p-6">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">No participants found</p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'No participants match the selected filter'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
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
                        {participant.completedAssessments} / {participant.assessmentCount}
                      </TableCell>
                      <TableCell>
                        {participant.averageScore > 0 ? (
                          <span className="font-medium">{participant.averageScore}%</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {participant.hasCoach ? (
                          <Badge variant="success">Has Coach</Badge>
                        ) : (
                          <Badge variant="secondary">No Coach</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/coach/participants/${participant.id}`)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!participant.hasCoach && (
                            <Button
                              onClick={() => handleAssignCoach(participant.id, true)}
                              variant="outline"
                              size="sm"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

