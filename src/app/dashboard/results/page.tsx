'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Share2, MessageCircle, ChevronRight, Download, FileText, AlertCircle } from 'lucide-react';
import { generateLeadershipReport } from '@/lib/generateReport';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchAssessments(userData.id);
      } catch {
        router.push('/signup');
      }
    } else {
      router.push('/signup');
    }
    setLoading(false);
  }, [router]);

  const fetchAssessments = async (userId: number) => {
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
      console.error('Failed to fetch assessments:', error);
    }
  };

  const handleDownloadReport = async () => {
    if (!user || !assessmentResults) return;
    
    setGeneratingPDF(true);
    try {
      const response = await fetch('/api/assessments', {
        headers: {
          'x-user-id': user.id.toString(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        generateLeadershipReport(
          { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email },
          data.summary
        );
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has completed any assessments
  const hasMBTI = assessmentResults?.mbti?.dominantResult;
  const hasTKI = assessmentResults?.tki?.dominantResult;
  const has360 = assessmentResults?.self_360?.dominantResult;
  const hasWellness = assessmentResults?.wellness?.overallScore !== undefined;
  const hasAnyAssessment = hasMBTI || hasTKI || has360 || hasWellness;

  // Dynamic leader profile based on assessment results
  const leaderProfile = [
    { label: 'MBTI', value: hasMBTI || 'Not completed', color: 'bg-neutral-800' },
    { label: 'TKI Dominant', value: hasTKI || 'Not completed', color: 'bg-neutral-800' },
    { label: '360°', value: has360 || 'Not completed', color: 'bg-primary-500' },
    { label: 'Light score', value: hasWellness ? `${assessmentResults.wellness.overallScore}%` : 'Not completed', color: 'bg-secondary-500' },
  ];

  // Development goals - only show if user has completed assessments
  const developmentGoals = hasAnyAssessment ? [
    { id: 1, title: 'Improve active listening', status: 'not_started' },
    { id: 2, title: 'Develop conflict resolution skills', status: 'not_started' },
    { id: 3, title: 'Enhance emotional intelligence', status: 'not_started' },
  ] : [];

  // Dynamic radar data based on wellness scores
  const wellnessScores = assessmentResults?.wellness?.scores || {};
  const radarData = [
    { label: 'Physical', value: wellnessScores.exercise || 0 },
    { label: 'Mental', value: wellnessScores.stress || 0 },
    { label: 'Emotional', value: wellnessScores.social || 0 },
    { label: 'Spiritual', value: wellnessScores.substances || 0 },
    { label: 'Social', value: wellnessScores.nutrition || 0 },
  ];

  // MBTI data - only if completed
  const mbtiData = hasMBTI ? assessmentResults.mbti : null;

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Results & Reports</h1>
            <p className="text-gray-600">Your comprehensive leadership assessment results</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={generatingPDF || !hasAnyAssessment}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {generatingPDF ? 'Generating...' : 'Download PDF Report'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share results
            </button>
            <button
              onClick={() => setShowCoachingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Coaching support
            </button>
          </div>
        </div>

        {/* Your leader profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your leader profile</h2>
          <p className="text-sm text-gray-500 mb-4">A snapshot of your leadership assessment results</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {leaderProfile.map((item, index) => (
              <div key={index} className={`${item.color} text-white rounded-xl p-4`}>
                <p className="text-xs opacity-80 mb-1">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Your development goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your development goals</h2>
              {developmentGoals.length > 0 && (
                <button className="text-primary-500 text-sm font-medium hover:underline">
                  View all
                </button>
              )}
            </div>
            
            {developmentGoals.length > 0 ? (
              <div className="space-y-3">
                {developmentGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        goal.status === 'completed' ? 'bg-green-500' :
                        goal.status === 'in_progress' ? 'bg-secondary-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-gray-700">{goal.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Complete your assessments to see development goals</p>
                <button 
                  onClick={() => router.push('/dashboard/assessments')}
                  className="mt-3 text-primary-500 text-sm font-medium hover:underline"
                >
                  Start an assessment →
                </button>
              </div>
            )}
          </div>

          {/* Your global profile - Radar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your global profile</h2>
            
            <div className="flex justify-center items-center h-64">
              <svg viewBox="0 0 200 200" className="w-full max-w-[250px]">
                {/* Background pentagon */}
                <polygon
                  points="100,20 180,70 160,160 40,160 20,70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <polygon
                  points="100,40 160,75 145,145 55,145 40,75"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <polygon
                  points="100,60 140,85 130,130 70,130 60,85"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <polygon
                  points="100,80 120,95 115,115 85,115 80,95"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                
                {/* Data polygon - only show if has wellness data */}
                {hasWellness && (
                  <polygon
                    points={`
                      ${100 + (radarData[0].value / 100) * 0 * 80},${100 - (radarData[0].value / 100) * 80}
                      ${100 + (radarData[1].value / 100) * 76 * Math.cos(Math.PI / 10)},${100 - (radarData[1].value / 100) * 76 * Math.sin(Math.PI / 10) + 50}
                      ${100 + (radarData[2].value / 100) * 47 * Math.cos(Math.PI / 5)},${100 + (radarData[2].value / 100) * 47 + 20}
                      ${100 - (radarData[3].value / 100) * 47 * Math.cos(Math.PI / 5)},${100 + (radarData[3].value / 100) * 47 + 20}
                      ${100 - (radarData[4].value / 100) * 76 * Math.cos(Math.PI / 10)},${100 - (radarData[4].value / 100) * 76 * Math.sin(Math.PI / 10) + 50}
                    `}
                    fill="rgba(13, 92, 92, 0.2)"
                    stroke="var(--color-primary-500)"
                    strokeWidth="2"
                  />
                )}
                
                {/* Labels */}
                <text x="100" y="10" textAnchor="middle" className="text-xs fill-gray-600">Physical</text>
                <text x="190" y="75" textAnchor="start" className="text-xs fill-gray-600">Mental</text>
                <text x="165" y="175" textAnchor="middle" className="text-xs fill-gray-600">Emotional</text>
                <text x="35" y="175" textAnchor="middle" className="text-xs fill-gray-600">Spiritual</text>
                <text x="10" y="75" textAnchor="end" className="text-xs fill-gray-600">Social</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Life cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Life cards</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* MBTI Personality Card - Only show data if MBTI is completed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">MBTI Personality</h3>
                  <p className="text-sm text-gray-500">Your personality type breakdown</p>
                </div>
                {hasMBTI && (
                  <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded font-medium">{hasMBTI}</span>
                )}
              </div>
              
              {hasMBTI ? (
                <>
                  <div className="space-y-3">
                    {mbtiData?.scores && Object.entries(mbtiData.scores).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value}%` }} />
                          </div>
                          <span className="text-sm font-medium">{value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
                    View full report <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Complete the MBTI assessment to see your results</p>
                  <button 
                    onClick={() => router.push('/dashboard/assessments')}
                    className="mt-2 text-primary-500 text-sm font-medium hover:underline"
                  >
                    Take MBTI assessment →
                  </button>
                </div>
              )}
            </div>

            {/* Life Cards Summary - Only show if user has completed assessments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Life Cards</h3>
                  <p className="text-sm text-gray-500">Your key strengths and areas for growth</p>
                </div>
              </div>
              
              {hasAnyAssessment ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {hasTKI && assessmentResults.tki.dominantResult === 'Collaborating' && (
                      <div className="bg-[#e8f4f4] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Strength</p>
                        <p className="text-sm font-medium text-primary-500">Collaboration</p>
                      </div>
                    )}
                    {hasTKI && assessmentResults.tki.dominantResult === 'Compromising' && (
                      <div className="bg-[#e8f4f4] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Strength</p>
                        <p className="text-sm font-medium text-primary-500">Flexibility</p>
                      </div>
                    )}
                    {has360 && (
                      <div className="bg-[#e8f4f4] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Strength</p>
                        <p className="text-sm font-medium text-primary-500">Self-awareness</p>
                      </div>
                    )}
                    {hasWellness && assessmentResults.wellness.overallScore >= 70 && (
                      <div className="bg-[#e8f4f4] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Strength</p>
                        <p className="text-sm font-medium text-primary-500">Well-being</p>
                      </div>
                    )}
                    {hasTKI && assessmentResults.tki.dominantResult === 'Avoiding' && (
                      <div className="bg-[#fef3cd] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Growth area</p>
                        <p className="text-sm font-medium text-secondary-500">Assertiveness</p>
                      </div>
                    )}
                    {hasWellness && assessmentResults.wellness.overallScore < 50 && (
                      <div className="bg-[#fef3cd] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Growth area</p>
                        <p className="text-sm font-medium text-secondary-500">Self-care</p>
                      </div>
                    )}
                  </div>
                  <button className="mt-4 text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
                    View all cards <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Complete your assessments to discover your strengths</p>
                  <button 
                    onClick={() => router.push('/dashboard/assessments')}
                    className="mt-2 text-primary-500 text-sm font-medium hover:underline"
                  >
                    Start an assessment →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ready to accelerate your growth CTA */}
        <div className="bg-primary-500 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to accelerate your growth?</h2>
          <p className="text-white/80 mb-6">Connect with a certified coach to unlock your full leadership potential</p>
          <button 
            onClick={() => setShowCoachingModal(true)}
            className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Schedule a coaching session
          </button>
        </div>
      </main>

      {/* Coaching Modal */}
      {showCoachingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ARISE Coaching support</h3>
              <button 
                onClick={() => setShowCoachingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              What type of coaching are you looking for?
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button className="p-4 border-2 border-primary-500 rounded-xl text-center hover:bg-[#e8f4f4] transition-colors">
                <p className="text-lg font-bold text-primary-500">&lt; 60min</p>
                <p className="text-xs text-gray-500">Quick session</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-xl text-center hover:border-primary-500 transition-colors">
                <p className="text-lg font-bold text-gray-700">3 Sessions</p>
                <p className="text-xs text-gray-500">Short program</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-xl text-center hover:border-primary-500 transition-colors">
                <p className="text-lg font-bold text-gray-700">5 Sessions</p>
                <p className="text-xs text-gray-500">Full program</p>
              </button>
            </div>
            
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors">
              Request coaching
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-secondary-500 text-white text-xs rounded font-medium">Share results</span>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share your results</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share your leadership profile with colleagues or coaches to get valuable feedback.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input 
                type="email" 
                placeholder="colleague@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
              <textarea 
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
