'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Button, Card, LoadingPage } from '@/components/ui';
import { ArrowLeft, Download, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '@/lib/token-refresh';
import { generateLeadershipReport } from '@/lib/generateReport';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

const categories = [
  { id: 'substances', name: 'Substances', icon: '🚫', color: '#e74c3c', description: 'Healthy choices regarding alcohol, tobacco, medications, and drugs' },
  { id: 'exercise', name: 'Exercise', icon: '🏃', color: '#27ae60', description: 'Physical activity, strength training, and mobility' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', color: '#f39c12', description: 'Balanced meals, fruits, vegetables, and hydration' },
  { id: 'sleep', name: 'Sleep', icon: '😴', color: '#9b59b6', description: 'Quality and quantity of restful sleep' },
  { id: 'social', name: 'Social', icon: '👥', color: '#3498db', description: 'Meaningful relationships and social connections' },
  { id: 'stress', name: 'Stress Management', icon: '🧘', color: '#0D5C5C', description: 'Stress awareness and healthy coping strategies' },
];

export default function WellnessDetailedResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wellnessResult, setWellnessResult] = useState<any>(null);

  const fetchWellnessResults = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/assessments?type=wellness');
      
      if (response.ok) {
        const data = await response.json();
        const wellnessAssessment = data.assessments?.find((a: any) => a.assessmentType === 'wellness');
        if (wellnessAssessment) {
          setWellnessResult(wellnessAssessment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Wellness results:', error);
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
            await fetchWellnessResults();
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
  }, [fetchWellnessResults, router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wellness Assessment Results',
          text: `My Light Score is ${overallScore}%. Check out my ARISE wellness assessment results!`,
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
    if (!user || !wellnessResult) return;
    
    generateLeadershipReport(
      { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email },
      {
        wellness: {
          dominantResult: overallLevel.level,
          overallScore: overallScore,
          scores: scores,
          completedAt: wellnessResult.completedAt,
        }
      }
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !wellnessResult) {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex">
        <Sidebar user={user || { id: 0, email: '' }} onLogout={handleLogout} />
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Wellness Results Found</h2>
            <p className="text-gray-600 mb-6">You haven't completed the Wellness assessment yet.</p>
            <Button onClick={() => router.push('/dashboard/wellness')} fullWidth>
              Take Wellness Assessment
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const scores = wellnessResult.scores || {};
  const overallScore = wellnessResult.overallScore || 0;
  const scoreEntries = Object.entries(scores) as [string, number][];
  const sortedScores = scoreEntries.sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedScores[0];
  const lowestCategory = sortedScores[sortedScores.length - 1];

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: '#27ae60', bgColor: '#d4edda' };
    if (score >= 60) return { level: 'Good', color: '#3498db', bgColor: '#d1ecf1' };
    if (score >= 40) return { level: 'Fair', color: '#f39c12', bgColor: '#fff3cd' };
    return { level: 'Needs Improvement', color: '#e74c3c', bgColor: '#f8d7da' };
  };

  const overallLevel = getScoreLevel(overallScore);

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
              leftIcon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              <span className="hidden sm:inline">Back to Results</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Wellness Assessment - Detailed Results</h1>
              <p className="text-sm sm:text-base text-gray-600">Your holistic well-being score</p>
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
                {overallScore}%
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Light Score</h2>
            <p className="text-lg font-semibold mb-1" style={{ color: overallLevel.color }}>
              {overallLevel.level}
            </p>
            <p className="text-gray-600">
              Completed on {new Date(wellnessResult.completedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-700 text-center">
              Your Light Score represents your overall well-being across six key dimensions. 
              A higher score indicates better balance and health in these areas of your life.
            </p>
          </div>
        </Card>

        {/* Category Scores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => {
            const score = scores[category.id] || 0;
            const level = getScoreLevel(score);
            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-2xl font-bold" style={{ color: level.color }}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${score}%`,
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
              const level = getScoreLevel(score);
              return (
                <div key={category.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1" style={{ color: level.color }}>
                        {score}%
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
                        width: `${score}%`,
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
                  Your {categories.find(c => c.id === lowestCategory[0])?.name.toLowerCase()} score of {lowestCategory[1]}% 
                  indicates an area where you could benefit from additional attention. Consider setting specific, 
                  achievable goals to improve this aspect of your well-being.
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
                  Your {categories.find(c => c.id === highestCategory[0])?.name.toLowerCase()} score of {highestCategory[1]}% 
                  is a strength in your wellness profile. Continue maintaining these healthy habits and consider 
                  sharing your strategies with others.
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Overall Wellness Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Maintain a balanced approach across all six dimensions</li>
                <li>Set small, achievable goals for improvement</li>
                <li>Track your progress regularly</li>
                <li>Celebrate small wins along the way</li>
                <li>Remember that wellness is a journey, not a destination</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
