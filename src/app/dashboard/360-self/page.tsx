'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, CheckCircle2, Users, MessageSquare, Award, Lightbulb, Brain, Heart } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

// Categories from the ARISE 360° assessment
const categories = [
  { id: 'communication', name: 'Communication', icon: MessageSquare, color: '#3498db' },
  { id: 'team_culture', name: 'Team Culture', icon: Users, color: '#27ae60' },
  { id: 'leadership', name: 'Leadership Style', icon: Award, color: '#9b59b6' },
  { id: 'change', name: 'Change Management', icon: Lightbulb, color: '#f39c12' },
  { id: 'problem_solving', name: 'Problem Solving', icon: Brain, color: '#e74c3c' },
  { id: 'stress', name: 'Stress Management', icon: Heart, color: 'var(--color-primary-500)' },
];

// Real questions from the ARISE Excel file - 360° Self Assessment
const selfAssessmentQuestions = [
  // Communication (5 questions)
  { id: 1, category: 'communication', text: "I communicate my ideas and expectations clearly and in a way that is easy to understand." },
  { id: 2, category: 'communication', text: "I listen attentively and demonstrate understanding of others' perspectives before responding." },
  { id: 3, category: 'communication', text: "I adapt my communication style to different audiences and situations." },
  { id: 4, category: 'communication', text: "I provide feedback that is respectful, actionable, and supportive of growth." },
  { id: 5, category: 'communication', text: "My communication fosters collaboration, engagement and alignment within the team." },
  
  // Team Culture (5 questions)
  { id: 6, category: 'team_culture', text: "I promote teamwork and support colleagues to achieve shared goals." },
  { id: 7, category: 'team_culture', text: "I treat team members with respect and encourage an inclusive environment where everyone feels valued." },
  { id: 8, category: 'team_culture', text: "I build trust within the team by being reliable, transparent and accountable." },
  { id: 9, category: 'team_culture', text: "I address and resolve conflicts in a constructive and respectful way." },
  { id: 10, category: 'team_culture', text: "I actively contribute to building a positive, motivating and collaborative team culture." },
  
  // Leadership Style (5 questions)
  { id: 11, category: 'leadership', text: "I inspire and motivate others towards a shared vision." },
  { id: 12, category: 'leadership', text: "I demonstrate fairness, integrity and consistency in my leadership." },
  { id: 13, category: 'leadership', text: "I empower others to take ownership and make decisions." },
  { id: 14, category: 'leadership', text: "I adapt my leadership style to different situations and individuals." },
  { id: 15, category: 'leadership', text: "I provide clear direction while also encouraging autonomy." },
  
  // Change Management (5 questions)
  { id: 16, category: 'change', text: "I embrace and adapt effectively to organizational changes." },
  { id: 17, category: 'change', text: "I help others understand and navigate change confidently." },
  { id: 18, category: 'change', text: "I maintain a positive and flexible attitude during transitions." },
  { id: 19, category: 'change', text: "I support the team effectively during challenges linked to change." },
  { id: 20, category: 'change', text: "I actively contribute to driving and sustaining change initiatives." },
  
  // Problem Solving and Decision Making (5 questions)
  { id: 21, category: 'problem_solving', text: "I analyze problems effectively and identify appropriate solutions." },
  { id: 22, category: 'problem_solving', text: "I consider diverse perspectives when solving problems." },
  { id: 23, category: 'problem_solving', text: "I manage disagreements constructively and seek mutually beneficial solutions." },
  { id: 24, category: 'problem_solving', text: "I remain calm and constructive under pressure." },
  { id: 25, category: 'problem_solving', text: "I follow through on problem-solving actions to ensure effective outcomes." },
  
  // Stress Management (5 questions)
  { id: 26, category: 'stress', text: "I manage stress without negatively affecting performance or team dynamics." },
  { id: 27, category: 'stress', text: "I demonstrate resilience and composure under pressure." },
  { id: 28, category: 'stress', text: "I use healthy coping strategies to handle stress effectively." },
  { id: 29, category: 'stress', text: "I support colleagues in managing stress and maintaining well-being." },
  { id: 30, category: 'stress', text: "I balance workload and prioritize effectively to prevent unnecessary stress." },
];

const answerOptions = [
  { value: 1, label: 'Never or Rarely', shortLabel: '1' },
  { value: 2, label: 'Sometimes', shortLabel: '2' },
  { value: 3, label: 'Often', shortLabel: '3' },
  { value: 4, label: 'Very Often', shortLabel: '4' },
  { value: 5, label: 'Almost Always', shortLabel: '5' },
];

type TestState = 'intro' | 'questions' | 'complete';

export default function SelfAssessment360Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testState, setTestState] = useState<TestState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleStartTest = () => {
    setTestState('questions');
  };

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [selfAssessmentQuestions[currentQuestion].id]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < selfAssessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final scores
      const categoryScores: Record<string, number> = {};
      const categoryTotals: Record<string, { total: number; count: number }> = {};
      
      categories.forEach(cat => {
        categoryTotals[cat.id] = { total: 0, count: 0 };
      });

      Object.entries(answers).forEach(([questionId, value]) => {
        const question = selfAssessmentQuestions.find(q => q.id === parseInt(questionId));
        if (question) {
          categoryTotals[question.category].total += value;
          categoryTotals[question.category].count += 1;
        }
      });

      Object.entries(categoryTotals).forEach(([category, data]) => {
        categoryScores[category] = data.count > 0 ? Math.round((data.total / (data.count * 5)) * 100) : 0;
      });

      const overallScore = Math.round(
        Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.values(categoryScores).length
      );
      const overallAverage = (overallScore / 20).toFixed(1); // Convert to 5-point scale

      // Save to database
      try {
        await fetch('/api/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id?.toString() || '',
          },
          body: JSON.stringify({
            assessmentType: 'self_360',
            answers: answers,
            scores: categoryScores,
            dominantResult: `${overallAverage}/5`,
            overallScore: overallScore,
          }),
        });
      } catch (error) {
        console.error('Failed to save 360 Self results:', error);
      }

      setTestState('complete');
      localStorage.setItem('arise_360_self_results', JSON.stringify(answers));
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScores = () => {
    const scores: Record<string, { total: number; count: number }> = {};
    categories.forEach(cat => {
      scores[cat.id] = { total: 0, count: 0 };
    });

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = selfAssessmentQuestions.find(q => q.id === parseInt(questionId));
      if (question) {
        scores[question.category].total += value;
        scores[question.category].count += 1;
      }
    });

    return Object.entries(scores).map(([category, data]) => ({
      category,
      score: data.count > 0 ? Math.round((data.total / (data.count * 5)) * 100) : 0,
      average: data.count > 0 ? (data.total / data.count).toFixed(1) : '0',
      name: categories.find(c => c.id === category)?.name || category,
      color: categories.find(c => c.id === category)?.color || 'var(--color-primary-500)',
    }));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / selfAssessmentQuestions.length) * 100;
  const currentQ = selfAssessmentQuestions[currentQuestion];
  const currentCategory = categories.find(c => c.id === currentQ?.category);
  const CategoryIcon = currentCategory?.icon || MessageSquare;

  // Intro Screen
  if (testState === 'intro') {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex">
        <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">360° Self Assessment</h1>
                  <p className="text-gray-600">Evaluate your leadership competencies</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-8">
                {/* Left side - Info */}
                <div className="flex-1">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Competency Areas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50"
                          >
                            <Icon className="w-4 h-4" style={{ color: cat.color }} />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold text-gray-900">30 Questions</span>
                      </div>
                      <p className="text-sm text-gray-600">5 per competency</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">10-15 Minutes</span>
                      </div>
                      <p className="text-sm text-gray-600">Estimated time</p>
                    </div>
                  </div>

                  {/* What you'll discover */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">What you&apos;ll discover</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Your self-perception across 6 leadership competencies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Strengths and areas for development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Foundation for 360° feedback comparison</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6 p-4 bg-primary-500/5 rounded-lg border border-primary-500/10">
                    <h3 className="text-sm font-semibold text-primary-500 mb-2">Instructions</h3>
                    <p className="text-sm text-gray-600">
                      Rate yourself honestly on each statement using the scale from 1 (Never/Rarely) to 5 (Almost Always). 
                      There are no right or wrong answers — this is about understanding your current leadership behaviors.
                    </p>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={handleStartTest}
                    className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-lg"
                  >
                    Start Self Assessment
                  </button>
                </div>

                {/* Right side - Visual */}
                <div className="w-64 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-white mx-auto mb-2" />
                        <span className="text-white font-bold text-lg">360°</span>
                        <p className="text-white/80 text-xs">Self View</p>
                      </div>
                    </div>
                    {/* Orbiting icons */}
                    {categories.map((cat, index) => {
                      const Icon = cat.icon;
                      const angle = (index * 60 - 90) * (Math.PI / 180);
                      const radius = 90;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <div
                          key={cat.id}
                          className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
                          style={{
                            left: `calc(50% + ${x}px - 20px)`,
                            top: `calc(50% + ${y}px - 20px)`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Questions Screen
  if (testState === 'questions') {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex">
        <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {selfAssessmentQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: currentCategory?.color || 'var(--color-primary-500)' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: currentCategory?.color }}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {currentCategory?.name}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                {currentQ.text}
              </h2>

              {/* Answer Options */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {answerOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      answers[currentQ.id] === option.value
                        ? 'border-primary-500 bg-[#e8f4f4]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-2xl font-bold mb-1 ${
                      answers[currentQ.id] === option.value ? 'text-primary-500' : 'text-gray-400'
                    }`}>
                      {option.value}
                    </span>
                  </button>
                ))}
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-gray-500 mb-8 px-2">
                <span>Never or Rarely</span>
                <span>Almost Always</span>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestion === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !answers[currentQ.id]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {currentQuestion === selfAssessmentQuestions.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Complete Screen
  const scores = calculateScores();
  const overallScore = Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length);
  const overallAverage = (scores.reduce((acc, s) => acc + parseFloat(s.average), 0) / scores.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Congratulations Banner */}
          <div className="bg-neutral-800 rounded-xl p-8 text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Self Assessment Complete!</h2>
            <p className="text-gray-300">Your 360° self-evaluation has been recorded</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Overall Self-Rating</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">{overallAverage}</span>
                  <span className="text-white/80 text-sm">/5</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  {parseFloat(overallAverage) >= 4 ? "You rate yourself highly across leadership competencies." :
                   parseFloat(overallAverage) >= 3 ? "You see yourself as competent with room for growth." :
                   "You've identified several areas for development."}
                </p>
                <p className="text-sm text-gray-500">
                  This self-assessment will be compared with feedback from your evaluators.
                </p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Scores by Competency</h3>
            <div className="space-y-4">
              {scores.sort((a, b) => b.score - a.score).map((item) => {
                const cat = categories.find(c => c.id === item.category);
                const Icon = cat?.icon || MessageSquare;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold" style={{ color: item.color }}>
                        {item.average}/5
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-primary-500/5 rounded-xl p-6 border border-primary-500/10 mb-6">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Next Steps</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-500">1.</span>
                <span>Invite colleagues, managers, and direct reports to provide their feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">2.</span>
                <span>Compare your self-perception with others&apos; perspectives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">3.</span>
                <span>Identify blind spots and hidden strengths</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard/results')}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold transition-colors"
            >
              View Results & Reports
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
