'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, LoadingPage } from '@/components/ui';
import { ArrowLeft, Download, Share2, TrendingUp, TrendingDown, MessageSquare, Users, Award, Lightbulb, Brain, Heart } from 'lucide-react';
import { authenticatedFetch } from '@/lib/token-refresh';
import { generateLeadershipReport } from '@/lib/generateReport';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

const categories = [
  { id: 'communication', name: 'Communication', icon: MessageSquare, color: '#3498db', description: 'Clear expression, active listening, and adaptive communication' },
  { id: 'team_culture', name: 'Team Culture', icon: Users, color: '#27ae60', description: 'Teamwork, respect, trust, and conflict resolution' },
  { id: 'leadership', name: 'Leadership Style', icon: Award, color: '#9b59b6', description: 'Inspiration, empowerment, and adaptive leadership' },
  { id: 'change', name: 'Change Management', icon: Lightbulb, color: '#f39c12', description: 'Adaptability, change navigation, and positive attitude' },
  { id: 'problem_solving', name: 'Problem Solving', icon: Brain, color: '#e74c3c', description: 'Analysis, diverse perspectives, and constructive solutions' },
  { id: 'stress', name: 'Stress Management', icon: Heart, color: '#0D5C5C', description: 'Resilience, composure, and healthy coping strategies' },
];

export default function Self360DetailedResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [self360Result, setSelf360Result] = useState<any>(null);

  const fetchSelf360Results = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/assessments?type=self_360');
      
      if (response.ok) {
        const data = await response.json();
        const self360Assessment = data.assessments?.find((a: any) => a.assessmentType === 'self_360');
        if (self360Assessment) {
          setSelf360Result(self360Assessment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch 360 Self results:', error);
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
            await fetchSelf360Results();
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
  }, [fetchSelf360Results, router]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My 360° Self Assessment Results',
          text: `My overall leadership rating is ${overallAverage}/5. Check out my ARISE 360° assessment results!`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
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
    if (!user || !self360Result) return;
    
    generateLeadershipReport(
      { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email },
      {
        self_360: {
          dominantResult: overallLevel.level,
          overallScore: overallScore,
          scores: scores,
          completedAt: self360Result.completedAt,
        }
      }
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !self360Result) {
    return (
      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No 360° Self Results Found</h2>
            <p className="text-gray-600 mb-6">You haven't completed the 360° Self assessment yet.</p>
            <Button onClick={() => router.push('/dashboard/360-self')} fullWidth>
              Take 360° Self Assessment
            </Button>
          </Card>
        </main>
  );
}

  const scores = self360Result.scores || {};
  const overallScore = self360Result.overallScore || 0;
  const overallAverage = (overallScore / 20).toFixed(1);
  const scoreEntries = Object.entries(scores) as [string, number][];
  const sortedScores = scoreEntries.sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedScores[0];
  const lowestCategory = sortedScores[sortedScores.length - 1];

  // Convert percentage score to 5-point scale average
  const getAverageScore = (score: number) => {
    return (score / 20).toFixed(1);
  };

  const getScoreLevel = (score: number) => {
    const avg = parseFloat(getAverageScore(score));
    if (avg >= 4.5) return { level: 'Excellent', color: '#27ae60', bgColor: '#d4edda' };
    if (avg >= 3.5) return { level: 'Good', color: '#3498db', bgColor: '#d1ecf1' };
    if (avg >= 2.5) return { level: 'Fair', color: '#f39c12', bgColor: '#fff3cd' };
    return { level: 'Needs Improvement', color: '#e74c3c', bgColor: '#f8d7da' };
  };

  const overallLevel = getScoreLevel(overallScore);

  return (
    <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/results')}
              leftIcon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              <span className="hidden sm:inline">Back to Results</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">360° Self Assessment - Detailed Results</h1>
              <p className="text-sm sm:text-base text-gray-600">Your leadership self-evaluation</p>
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

        {/* Overall Score Card */}
        <Card className="mb-6 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4" style={{ backgroundColor: overallLevel.bgColor }}>
              <span className="text-5xl font-bold" style={{ color: overallLevel.color }}>
                {overallAverage}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">out of 5.0</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Overall Rating</h2>
            <p className="text-lg font-semibold mb-1" style={{ color: overallLevel.color }}>
              {overallLevel.level}
            </p>
            <p className="text-gray-600">
              Completed on {new Date(self360Result.completedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-700 text-center">
              This self-assessment evaluates your leadership capabilities across six key dimensions. 
              Your scores reflect your self-perception of your leadership behaviors and skills.
            </p>
          </div>
        </Card>

        {/* Category Scores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => {
            const score = scores[category.id] || 0;
            const avg = getAverageScore(score);
            const level = getScoreLevel(score);
            const Icon = category.icon;
            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="text-2xl font-bold" style={{ color: level.color }}>
                      {avg}/5.0
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(parseFloat(avg) / 5) * 100}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {score === highestCategory[1] && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Strongest
                    </span>
                  )}
                  {score === lowestCategory[1] && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Focus Area
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: level.bgColor, color: level.color }}>
                    {level.level}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h2>
          <div className="space-y-6">
            {categories.map((category) => {
              const score = scores[category.id] || 0;
              const avg = getAverageScore(score);
              const level = getScoreLevel(score);
              const Icon = category.icon;
              return (
                <div key={category.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1" style={{ color: level.color }}>
                        {avg}/5.0
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: level.bgColor, color: level.color }}>
                        {level.level}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(parseFloat(avg) / 5) * 100}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-4">
            {lowestCategory && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Focus Area: {categories.find(c => c.id === lowestCategory[0])?.name}
                </h3>
                <p className="text-sm text-orange-800">
                  Your {categories.find(c => c.id === lowestCategory[0])?.name.toLowerCase()} score of {getAverageScore(lowestCategory[1])}/5.0 
                  indicates an area where you could benefit from additional development. Consider seeking feedback from 
                  colleagues or a coach to identify specific improvement opportunities.
                </p>
              </div>
            )}
            {highestCategory && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Strength: {categories.find(c => c.id === highestCategory[0])?.name}
                </h3>
                <p className="text-sm text-green-800">
                  Your {categories.find(c => c.id === highestCategory[0])?.name.toLowerCase()} score of {getAverageScore(highestCategory[1])}/5.0 
                  is a strength in your leadership profile. Continue developing this area and consider mentoring others 
                  or sharing your expertise.
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Leadership Development Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Seek 360° feedback from colleagues to compare self-perception with others' views</li>
                <li>Set specific, measurable goals for improvement in lower-scoring areas</li>
                <li>Practice new leadership behaviors in low-stakes situations</li>
                <li>Reflect regularly on your leadership effectiveness</li>
                <li>Consider working with a leadership coach for personalized development</li>
              </ul>
            </div>
          </div>
        </Card>
    </main>
  );
}
