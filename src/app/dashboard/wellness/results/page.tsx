'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

const categories = [
  { id: 'physical', name: 'Physical', color: '#0D5C5C', description: 'Body health and vitality' },
  { id: 'mental', name: 'Mental', color: '#D4A84B', description: 'Cognitive function and clarity' },
  { id: 'emotional', name: 'Emotional', color: '#8B5CF6', description: 'Emotional awareness and regulation' },
  { id: 'spiritual', name: 'Spiritual', color: '#EC4899', description: 'Purpose and meaning' },
];

const questionCategories: Record<number, string> = {
  1: 'physical', 2: 'physical', 3: 'physical', 4: 'physical', 5: 'physical',
  6: 'mental', 7: 'mental', 8: 'mental', 9: 'mental', 10: 'mental',
  11: 'emotional', 12: 'emotional', 13: 'emotional', 14: 'emotional', 15: 'emotional',
  16: 'spiritual', 17: 'spiritual', 18: 'spiritual', 19: 'spiritual', 20: 'spiritual',
};

export default function WellnessResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Record<string, number>>({});

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Load results
    const savedResults = localStorage.getItem('arise_wellness_results');
    if (savedResults) {
      const answers = JSON.parse(savedResults);
      
      // Calculate scores per category
      const categoryScores: Record<string, { total: number; count: number }> = {
        physical: { total: 0, count: 0 },
        mental: { total: 0, count: 0 },
        emotional: { total: 0, count: 0 },
        spiritual: { total: 0, count: 0 },
      };

      Object.entries(answers).forEach(([questionId, score]) => {
        const category = questionCategories[parseInt(questionId)];
        if (category && categoryScores[category]) {
          categoryScores[category].total += score as number;
          categoryScores[category].count += 1;
        }
      });

      // Convert to percentages
      const percentages: Record<string, number> = {};
      Object.entries(categoryScores).forEach(([category, data]) => {
        if (data.count > 0) {
          percentages[category] = Math.round((data.total / (data.count * 5)) * 100);
        } else {
          percentages[category] = 0;
        }
      });

      setResults(percentages);
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  const overallScore = Object.values(results).length > 0
    ? Math.round(Object.values(results).reduce((a, b) => a + b, 0) / Object.values(results).length)
    : 0;

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Needs Attention';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-[#D4A84B]';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#0D5C5C]">
      <div className="flex">
        <Sidebar user={user} activePage="results" onLogout={handleLogout} />
        
        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Dashboard</span>
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900">Wellness Assessment Results</h1>
                  <p className="text-gray-500 mt-1">Your holistic well-being profile</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="p-8 bg-gradient-to-r from-[#0D5C5C] to-[#0a4a4a]">
              <div className="text-center">
                <p className="text-white/70 text-sm mb-2">Overall Wellness Score</p>
                <div className="text-6xl font-bold text-[#D4A84B] mb-2">{overallScore}%</div>
                <p className={`text-lg font-semibold ${overallScore >= 60 ? 'text-green-400' : 'text-orange-400'}`}>
                  {getScoreLabel(overallScore)}
                </p>
              </div>
            </div>

            {/* Category Scores */}
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Dimension Breakdown</h2>
              <div className="grid grid-cols-2 gap-6">
                {categories.map((category) => {
                  const score = results[category.id] || 0;
                  return (
                    <div key={category.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-xs text-gray-500">{category.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                          <p className="text-xs text-gray-500">{getScoreLabel(score)}</p>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${score}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
              <div className="space-y-4">
                {categories
                  .filter(cat => (results[cat.id] || 0) < 70)
                  .slice(0, 3)
                  .map((category) => (
                    <div key={category.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Improve your {category.name.toLowerCase()} wellness</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {category.id === 'physical' && 'Consider incorporating more regular exercise and improving your sleep habits.'}
                            {category.id === 'mental' && 'Try mindfulness practices and set clear goals for personal development.'}
                            {category.id === 'emotional' && 'Focus on building stronger relationships and practicing self-compassion.'}
                            {category.id === 'spiritual' && 'Explore activities that bring meaning and practice regular gratitude.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                {categories.filter(cat => (results[cat.id] || 0) < 70).length === 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800">
                      Great job! Your wellness scores are strong across all dimensions. Keep up the excellent work!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/dashboard/development"
                  className="flex-1 py-3 text-center bg-[#0D5C5C] text-white font-medium rounded-lg hover:bg-[#0a4a4a] transition-colors"
                >
                  View Development Plan
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
