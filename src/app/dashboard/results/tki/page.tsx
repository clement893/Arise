'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Button, Card, CardContent, LoadingPage } from '@/components/ui';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/token-refresh';
import { generateLeadershipReport } from '@/lib/generateReport';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

type TKIMode = 'Competing' | 'Collaborating' | 'Compromising' | 'Avoiding' | 'Accommodating';

const modeDescriptions: Record<TKIMode, { title: string; description: string; color: string; whenToUse: string[] }> = {
  Competing: {
    title: "Competing",
    description: "You pursue your own concerns at the other person's expense. This is a power-oriented mode where you use whatever power seems appropriate to win your position.",
    color: "#e74c3c",
    whenToUse: [
      "When quick, decisive action is vital",
      "On important issues where unpopular actions need implementing",
      "On issues vital to company welfare when you know you're right",
      "To protect yourself against people who take advantage of noncompetitive behavior"
    ]
  },
  Collaborating: {
    title: "Collaborating",
    description: "You work with the other person to find a solution that fully satisfies both parties. This involves digging into an issue to identify underlying concerns.",
    color: "#27ae60",
    whenToUse: [
      "To find an integrative solution when both sets of concerns are too important to be compromised",
      "When your objective is to learn",
      "To merge insights from people with different perspectives",
      "To gain commitment by incorporating concerns into a consensus"
    ]
  },
  Compromising: {
    title: "Compromising",
    description: "You find an expedient, mutually acceptable solution that partially satisfies both parties. You give up more than competing but less than accommodating.",
    color: "#f39c12",
    whenToUse: [
      "When goals are moderately important but not worth the effort of potential disruption",
      "When two opponents with equal power are strongly committed to mutually exclusive goals",
      "As a temporary expedient to complex issues",
      "As a backup when collaboration or competition is unsuccessful"
    ]
  },
  Avoiding: {
    title: "Avoiding",
    description: "You don't immediately pursue your own concerns or those of the other person. You sidestep the conflict, postpone it, or simply withdraw.",
    color: "#9b59b6",
    whenToUse: [
      "When an issue is trivial or more important issues are pressing",
      "When you perceive no chance of satisfying your concerns",
      "When potential disruption outweighs the benefits of resolution",
      "To let people cool down and regain perspective"
    ]
  },
  Accommodating: {
    title: "Accommodating",
    description: "You neglect your own concerns to satisfy the concerns of the other person. You might selflessly yield to another's point of view.",
    color: "#3498db",
    whenToUse: [
      "When you realize you are wrong",
      "When the issue is much more important to the other person",
      "To build social credits for later issues",
      "When preserving harmony and avoiding disruption are especially important"
    ]
  }
};

export default function TKIDetailedResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tkiResult, setTkiResult] = useState<any>(null);

  const fetchTKIResults = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/assessments?type=tki');
      
      if (response.ok) {
        const data = await response.json();
        const tkiAssessment = data.assessments?.find((a: any) => a.assessmentType === 'tki');
        if (tkiAssessment) {
          setTkiResult(tkiAssessment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch TKI results:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      const storedUser = localStorage.getItem('arise_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (isMounted) {
            setUser(userData);
            await fetchTKIResults();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          if (isMounted) {
            router.push('/signup');
          }
          return;
        }
      } else {
        if (isMounted) {
          router.push('/signup');
        }
        return;
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchTKIResults, router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My TKI Conflict Style Results',
          text: `My dominant conflict style is ${dominantMode}. Check out my ARISE leadership assessment results!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Please copy this link manually: ' + window.location.href);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!user || !tkiResult) return;
    
    generateLeadershipReport(
      { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email },
      {
        tki: {
          dominantResult: dominantMode,
          overallScore: Math.round((maxScore / 12) * 100),
          scores: scores,
          completedAt: tkiResult.completedAt,
        }
      }
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !tkiResult) {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex">
        <Sidebar user={user || { id: 0, email: '' }} onLogout={handleLogout} />
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No TKI Results Found</h2>
            <p className="text-gray-600 mb-6">You haven't completed the TKI assessment yet.</p>
            <Button onClick={() => router.push('/dashboard/tki')} fullWidth>
              Take TKI Assessment
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const scores = (tkiResult.scores || {}) as Record<TKIMode, number>;
  const dominantMode = tkiResult.dominantResult as TKIMode;
  const modeEntries = Object.entries(scores) as [TKIMode, number][];
  const maxScore = Math.max(...Object.values(scores).map(v => typeof v === 'number' ? v : 0));
  const sortedModes = modeEntries.sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/results')}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to Results
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TKI Conflict Style - Detailed Results</h1>
              <p className="text-sm sm:text-base text-gray-600">Thomas-Kilmann Conflict Mode Instrument</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={handleShare}
              className="w-full sm:w-auto"
            >
              Share
            </Button>
            <Button 
              variant="secondary" 
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto"
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Dominant Style Card */}
        <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: modeDescriptions[dominantMode].color }}
            >
              {dominantMode.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Dominant Style: {dominantMode}</h2>
                <span className="px-2 sm:px-3 py-1 bg-primary-500 text-white text-xs sm:text-sm rounded-full font-medium self-start sm:self-auto">
                  {scores[dominantMode]}/12
                </span>
              </div>
              <p className="text-gray-600 mb-4">{modeDescriptions[dominantMode].description}</p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When to use this style:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {modeDescriptions[dominantMode].whenToUse.map((use, idx) => (
                    <li key={idx} className="text-sm">{use}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* All Scores */}
        <Card className="mb-6 p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Your Conflict Style Scores</h2>
          <div className="space-y-4">
            {sortedModes.map(([mode, score]) => {
              const percentage = (score / maxScore) * 100;
              const isDominant = mode === dominantMode;
              return (
                <div key={mode} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: modeDescriptions[mode].color }}
                      />
                      <span className="font-medium text-gray-900">{mode}</span>
                      {isDominant && (
                        <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded">
                          Dominant
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">{score}/12</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: modeDescriptions[mode].color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* All Styles Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(modeDescriptions).map(([mode, info]) => {
            const score = scores[mode as TKIMode] || 0;
            const isDominant = mode === dominantMode;
            return (
              <Card key={mode} className={`p-5 ${isDominant ? 'ring-2 ring-primary-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: info.color }}
                  >
                    {mode.charAt(0)}
                  </div>
                  {isDominant && (
                    <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded">
                      Your Style
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Score:</span>
                  <span className="font-semibold text-gray-900">{score}/12</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        <Card className="p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Develop Flexibility</h3>
              <p className="text-sm text-blue-800">
                While {dominantMode} is your preferred style, effective conflict resolution often requires 
                adapting your approach based on the situation. Consider practicing other styles, especially 
                {sortedModes[sortedModes.length - 1][0]} which scored lowest in your assessment.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Leverage Your Strengths</h3>
              <p className="text-sm text-green-800">
                Your {dominantMode} style is particularly effective in situations where {modeDescriptions[dominantMode].whenToUse[0].toLowerCase()}. 
                Continue to use this approach when appropriate.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Practice Active Listening</h3>
              <p className="text-sm text-yellow-800">
                Regardless of your conflict style, active listening and understanding the other person's 
                perspective can significantly improve conflict resolution outcomes.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
