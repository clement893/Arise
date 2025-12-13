'use client';

import { Button, Card, CardContent, Badge, Spinner, LoadingPage } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, Users, Mail, Plus, X, Send, UserPlus, Briefcase, UserCheck, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface Evaluator {
  id: number;
  name: string;
  email: string;
  relationship: 'manager' | 'peer' | 'direct_report' | 'other';
  status: 'pending' | 'invited' | 'started' | 'completed';
  inviteSentAt?: string;
  completedAt?: string;
}

const relationshipOptions = [
  { value: 'manager', label: 'Manager / Supervisor', icon: Briefcase, description: 'Your direct manager or supervisor' },
  { value: 'peer', label: 'Peer / Colleague', icon: Users, description: 'Colleagues at the same level' },
  { value: 'direct_report', label: 'Direct Report', icon: UserCheck, description: 'People who report to you' },
  { value: 'other', label: 'Other', icon: UserPlus, description: 'Other professional contacts' },
];

export default function AddEvaluatorsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '', relationship: 'peer' as const });
  const [sendingInvites, setSendingInvites] = useState(false);
  const [addingEvaluator, setAddingEvaluator] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchEvaluators(parsedUser.id);
  }, [router]);

  const fetchEvaluators = async (userId: number) => {
    try {
      const response = await fetch(`/api/evaluators?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setEvaluators(data.evaluators);
      }
    } catch (error) {
      console.error('Failed to fetch evaluators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleAddEvaluator = async () => {
    if (!newEvaluator.name || !newEvaluator.email || !user) return;
    
    setAddingEvaluator(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/evaluators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newEvaluator.name,
          email: newEvaluator.email,
          relationship: newEvaluator.relationship,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEvaluators(prev => [data.evaluator, ...prev]);
        setNewEvaluator({ name: '', email: '', relationship: 'peer' });
        setShowAddForm(false);
        setSuccessMessage(`${newEvaluator.name} has been added. You'll receive a confirmation email.`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to add evaluator');
      }
    } catch (error) {
      setErrorMessage('Failed to add evaluator. Please try again.');
    } finally {
      setAddingEvaluator(false);
    }
  };

  const handleRemoveEvaluator = async (id: number) => {
    try {
      const response = await fetch(`/api/evaluators?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvaluators(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove evaluator:', error);
    }
  };

  const handleSendInvites = async () => {
    if (!user) return;
    
    setSendingInvites(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/evaluators/send-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh evaluators list
        await fetchEvaluators(user.id);
        setSuccessMessage(`${data.results.success} invitation(s) sent successfully! You've been CC'd on each email.`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to send invitations');
      }
    } catch (error) {
      setErrorMessage('Failed to send invitations. Please try again.');
    } finally {
      setSendingInvites(false);
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    const option = relationshipOptions.find(o => o.value === relationship);
    return option ? option.icon : Users;
  };

  const getRelationshipLabel = (relationship: string) => {
    const option = relationshipOptions.find(o => o.value === relationship);
    return option ? option.label : relationship;
  };

  const getStatusBadge = (status: Evaluator['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'invited':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Invited
          </span>
        );
      case 'started':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
    }
  };

  const pendingCount = evaluators.filter(e => e.status === 'pending').length;
  const invitedCount = evaluators.filter(e => e.status === 'invited' || e.status === 'started').length;
  const completedCount = evaluators.filter(e => e.status === 'completed').length;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add 360° Evaluators</h1>
              <p className="text-gray-600">Invite colleagues to provide feedback on your leadership</p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="ml-auto text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Why 360° Feedback?</h2>
                <p className="text-sm text-gray-600 mb-3">
                  360° feedback provides a comprehensive view of your leadership by gathering perspectives from people who work with you at different levels. This multi-source feedback helps identify blind spots and strengths you might not see yourself.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">1-2 Managers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">3-5 Peers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600">2-4 Direct Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {evaluators.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-gray-400">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-blue-500">{invitedCount}</p>
                <p className="text-sm text-gray-500">Invited</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-green-500">{completedCount}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          )}

          {/* Evaluators List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Your Evaluators ({evaluators.length})</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Evaluator
              </button>
            </div>

            {evaluators.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No evaluators added yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Add colleagues, managers, and direct reports to get comprehensive feedback
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  Add your first evaluator
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {evaluators.map((evaluator) => {
                  const Icon = getRelationshipIcon(evaluator.relationship);
                  return (
                    <div key={evaluator.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{evaluator.name}</p>
                          <p className="text-sm text-gray-500">{evaluator.email}</p>
                          <p className="text-xs text-gray-400">{getRelationshipLabel(evaluator.relationship)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(evaluator.status)}
                        {evaluator.status !== 'completed' && (
                          <button
                            onClick={() => handleRemoveEvaluator(evaluator.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove evaluator"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send Invites Button */}
          {pendingCount > 0 && (
            <button
              onClick={handleSendInvites}
              disabled={sendingInvites}
              className="w-full py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sendingInvites ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending invitations...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send {pendingCount} invitation{pendingCount > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}

          {/* Note */}
          <div className="mt-6 p-4 bg-primary-500/5 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">How it works</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Add evaluators and click "Send invitations"</li>
                <li>Each evaluator receives a unique link to provide feedback</li>
                <li>You'll be CC'd on all invitation emails</li>
                <li>You'll be notified when each evaluator completes their feedback</li>
                <li>All responses are anonymous and aggregated</li>
              </ul>
              <button
                onClick={() => router.push('/dashboard/360-self')}
                className="mt-3 text-primary-500 font-medium hover:underline"
              >
                Complete your self-assessment first →
              </button>
            </div>
          </div>
        </div>

        {/* Add Evaluator Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Evaluator</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setErrorMessage('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEvaluator.name}
                    onChange={(e) => setNewEvaluator({ ...newEvaluator, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEvaluator.email}
                    onChange={(e) => setNewEvaluator({ ...newEvaluator, email: e.target.value })}
                    placeholder="john.doe@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <div className="grid grid-cols-2 gap-2">
                    {relationshipOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setNewEvaluator({ ...newEvaluator, relationship: option.value as any })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            newEvaluator.relationship === option.value
                              ? 'border-primary-500 bg-primary-500/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${
                            newEvaluator.relationship === option.value ? 'text-primary-500' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            newEvaluator.relationship === option.value ? 'text-primary-500' : 'text-gray-700'
                          }`}>
                            {option.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvaluator}
                  disabled={!newEvaluator.name || !newEvaluator.email || addingEvaluator}
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingEvaluator ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Evaluator'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
