'use client';

import { Button, Card, CardContent, Badge, Spinner, LoadingPage } from '@/components/ui';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, Download, Share2, ChevronRight } from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export default function WellnessBoardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        router.push('/signup');
      }
    } else {
      router.push('/signup');
    }
    setLoading(false);
  }, [router]);

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

  const wellnessScores = {
    physical: 85,
    mental: 72,
    emotional: 68,
    spiritual: 55,
  };

  const overallScore = Math.round(
    (wellnessScores.physical + wellnessScores.mental + wellnessScores.emotional + wellnessScores.spiritual) / 4
  );

  const recommendations = [
    {
      category: 'Physical',
      title: 'Daily Movement Practice',
      description: 'Incorporate 30 minutes of physical activity into your daily routine.',
      priority: 'high',
    },
    {
      category: 'Mental',
      title: 'Mindfulness Meditation',
      description: 'Practice 10-15 minutes of meditation each morning to improve focus.',
      priority: 'medium',
    },
    {
      category: 'Emotional',
      title: 'Journaling Practice',
      description: 'Write in a gratitude journal before bed to process emotions.',
      priority: 'medium',
    },
    {
      category: 'Spiritual',
      title: 'Purpose Reflection',
      description: 'Spend time weekly reflecting on your values and life purpose.',
      priority: 'high',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/dashboard/results')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Your Wellness Board</h1>
            <p className="text-gray-600">Detailed wellness assessment results</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-primary-500 rounded-xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{overallScore}%</span>
            </div>
            <div>
              <h2 className="text-xl font-bold !text-white mb-1">Light score</h2>
              <p className="text-white/80">Your overall wellness score based on all dimensions</p>
            </div>
          </div>
        </div>

        {/* Your global profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your global profile</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="flex justify-center items-center">
              <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
                {/* Background circles */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Axis lines */}
                <line x1="100" y1="20" x2="100" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="43" y1="43" x2="157" y2="157" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="157" y1="43" x2="43" y2="157" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Data polygon */}
                <polygon
                  points={`
                    100,${100 - (wellnessScores.physical / 100) * 80}
                    ${100 + (wellnessScores.mental / 100) * 80},100
                    100,${100 + (wellnessScores.emotional / 100) * 80}
                    ${100 - (wellnessScores.spiritual / 100) * 80},100
                  `}
                  fill="rgba(13, 92, 92, 0.2)"
                  stroke="var(--color-primary-500)"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                <circle cx="100" cy={100 - (wellnessScores.physical / 100) * 80} r="4" fill="var(--color-primary-500)" />
                <circle cx={100 + (wellnessScores.mental / 100) * 80} cy="100" r="4" fill="var(--color-primary-500)" />
                <circle cx="100" cy={100 + (wellnessScores.emotional / 100) * 80} r="4" fill="var(--color-primary-500)" />
                <circle cx={100 - (wellnessScores.spiritual / 100) * 80} cy="100" r="4" fill="var(--color-primary-500)" />
                
                {/* Labels */}
                <text x="100" y="10" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Physical</text>
                <text x="195" y="105" textAnchor="start" className="text-xs fill-gray-600 font-medium">Mental</text>
                <text x="100" y="198" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Emotional</text>
                <text x="5" y="105" textAnchor="start" className="text-xs fill-gray-600 font-medium">Spiritual</text>
              </svg>
            </div>
            
            {/* Score breakdown */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Physical</span>
                  <span className="text-sm font-bold text-primary-500">{wellnessScores.physical}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                    style={{ width: `${wellnessScores.physical}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Mental</span>
                  <span className="text-sm font-bold text-primary-500">{wellnessScores.mental}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                    style={{ width: `${wellnessScores.mental}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Emotional</span>
                  <span className="text-sm font-bold text-secondary-500">{wellnessScores.emotional}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary-500 rounded-full transition-all duration-500" 
                    style={{ width: `${wellnessScores.emotional}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Spiritual</span>
                  <span className="text-sm font-bold text-secondary-500">{wellnessScores.spiritual}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary-500 rounded-full transition-all duration-500" 
                    style={{ width: `${wellnessScores.spiritual}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Physical */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#e8f4f4] rounded-lg flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Physical Wellness</h3>
                  <p className="text-sm text-primary-500 font-medium">{wellnessScores.physical}% - Excellent</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your physical wellness is strong. You maintain good exercise habits and prioritize your physical health.
              </p>
            </div>
            
            {/* Mental */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#e8f4f4] rounded-lg flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mental Wellness</h3>
                  <p className="text-sm text-primary-500 font-medium">{wellnessScores.mental}% - Good</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your mental wellness is good. Consider incorporating more mindfulness practices to further enhance focus.
              </p>
            </div>
            
            {/* Emotional */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#fef3cd] rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Emotional Wellness</h3>
                  <p className="text-sm text-secondary-500 font-medium">{wellnessScores.emotional}% - Developing</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                There&apos;s room for growth in emotional wellness. Focus on building stronger emotional awareness and regulation.
              </p>
            </div>
            
            {/* Spiritual */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#fef3cd] rounded-lg flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Spiritual Wellness</h3>
                  <p className="text-sm text-secondary-500 font-medium">{wellnessScores.spiritual}% - Needs Attention</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your spiritual wellness could benefit from more attention. Consider exploring practices that connect you to your purpose.
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full mt-2 ${rec.priority === 'high' ? 'bg-secondary-500' : 'bg-primary-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">{rec.category}</span>
                    {rec.priority === 'high' && (
                      <span className="px-2 py-0.5 bg-secondary-500/20 text-secondary-500 text-xs rounded-full font-medium">Priority</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Ready to accelerate your growth CTA */}
        <div className="bg-primary-500 rounded-xl p-8 flex items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold !text-white mb-2">Ready to accelerate your growth?</h2>
            <p className="text-white/80">Connect with a certified coach to work on your wellness goals</p>
          </div>
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap">
            Schedule coaching
          </button>
        </div>
      </main>
    </div>
  );
}
