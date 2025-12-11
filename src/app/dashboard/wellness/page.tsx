'use client';

import { Button, Card, CardContent, Badge, Spinner, LoadingPage } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, CheckCircle2 } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

// Categories from the ARISE assessment
const categories = [
  { id: 'substances', name: 'Substances', icon: '🚫', color: '#e74c3c' },
  { id: 'exercise', name: 'Exercise', icon: '🏃', color: '#27ae60' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', color: '#f39c12' },
  { id: 'sleep', name: 'Sleep', icon: '😴', color: '#9b59b6' },
  { id: 'social', name: 'Social', icon: '👥', color: '#3498db' },
  { id: 'stress', name: 'Stress', icon: '🧘', color: 'var(--color-primary-500)' },
];

// Real questions from the ARISE Excel file
const wellnessQuestions = [
  // Substances (5 questions)
  { id: 1, category: 'substances', text: "I avoid or limit my weekly alcohol consumption to about 2 glasses per week." },
  { id: 2, category: 'substances', text: "I make healthy choices by avoiding tobacco in all forms, such as smoking, vaping, or chewing tobacco." },
  { id: 3, category: 'substances', text: "I take prescription and over-the-counter medications responsibly, following dosage instructions and consulting healthcare providers when needed." },
  { id: 4, category: 'substances', text: "I keep my caffeine consumption within healthy limits, which is no more than 3 cups of coffee or 8 cups of tea per day." },
  { id: 5, category: 'substances', text: "I do not consume illegal drugs and avoid usage of recreational drugs." },
  
  // Exercise (5 questions)
  { id: 6, category: 'exercise', text: "I am regularly active for at least 150 min (1.5h) per week in ways that get my heart rate up, like fast walking, cycling, or swimming." },
  { id: 7, category: 'exercise', text: "I do strength or resistance training, such as weightlifting, bodyweight exercises, or resistance bands, at least 2 times per week." },
  { id: 8, category: 'exercise', text: "I do flexibility or mobility exercises, such as stretching or yoga, at least 2–3 times per week." },
  { id: 9, category: 'exercise', text: "I avoid sitting for longer than 30–60 minutes at a time by standing, walking, or moving around during the day." },
  { id: 10, category: 'exercise', text: "I have the physical and mental energy to stay active, focused, and productive throughout the day." },
  
  // Nutrition (5 questions)
  { id: 11, category: 'nutrition', text: "I make it a habit to eat balanced meals — for example, meals that combine protein (like fish, beans, or eggs), healthy fats (like nuts or olive oil), and complex carbs (like whole grains or vegetables)." },
  { id: 12, category: 'nutrition', text: "Each day, I make sure to eat fruits and vegetables — about 5 or more servings, such as a piece of fruit, a handful of raw veggies, or half a cup of cooked vegetables." },
  { id: 13, category: 'nutrition', text: "I maintain a healthier lifestyle by focusing on nutritious foods while keeping processed foods, sugary drinks, and sweet snacks to a minimum — treating them as occasional rather than everyday choices." },
  { id: 14, category: 'nutrition', text: "I make sure to drink enough water throughout the day, aiming for the recommended amount — about 2.7 liters (91 ounces) for women and 3.8 liters (128 ounces) for men." },
  { id: 15, category: 'nutrition', text: "I consistently follow healthy eating habits (closer to 80%) while allowing some flexibility during the week (closer to 20%)." },
  
  // Sleep (5 questions)
  { id: 16, category: 'sleep', text: "I get 7–9 hours of sleep most nights, supporting my health and daily energy." },
  { id: 17, category: 'sleep', text: "I maintain a regular sleep schedule by going to bed and waking up at consistent times." },
  { id: 18, category: 'sleep', text: "Most nights, my sleep feels restful and restorative, leaving me refreshed in the morning." },
  { id: 19, category: 'sleep', text: "I prepare for restful sleep by limiting caffeine, alcohol, and screen use (such as TV, phone, or computer) in the hours before bed." },
  { id: 20, category: 'sleep', text: "If my sleep is disrupted by stress, noise, or restlessness, I take healthy steps — such as calming my mind, adjusting my environment, or practicing relaxation techniques — to improve my rest." },
  
  // Social (5 questions)
  { id: 21, category: 'social', text: "I have close personal relationships that are strong, supportive, and nurturing, and I feel I can rely on them in times of need." },
  { id: 22, category: 'social', text: "I connect with friends, family, or community several times a week in meaningful ways — such as supportive conversations, shared activities, or quality time together." },
  { id: 23, category: 'social', text: "I feel comfortable seeking support from others when I need it." },
  { id: 24, category: 'social', text: "I choose positive and uplifting social interactions that support my well-being." },
  { id: 25, category: 'social', text: "I balance time with others and time alone in a way that supports my health and happiness — making space for meaningful connection while also honoring my need for rest and personal time." },
  
  // Stress (5 questions)
  { id: 26, category: 'stress', text: "I notice when I am feeling stressed and use healthy strategies — such as deep breathing, taking breaks, or talking to someone — to manage it effectively." },
  { id: 27, category: 'stress', text: "A few times each week, I practice relaxation techniques — such as meditation, stretching, or deep breathing — to help reduce stress and restore calm." },
  { id: 28, category: 'stress', text: "I make time several times a week for hobbies, fun, or personal enjoyment, which helps me relax, recharge, and maintain balance in my life." },
  { id: 29, category: 'stress', text: "I manage my workload in a balanced way, setting healthy limits and taking breaks when needed, so I can stay productive without feeling overwhelmed." },
  { id: 30, category: 'stress', text: "I experience a sense of calm, focus, and emotional balance in my daily life, helping me handle challenges with resilience and clarity." },
];

const answerOptions = [
  { value: 1, label: 'Strongly Disagree', shortLabel: 'SD' },
  { value: 2, label: 'Disagree', shortLabel: 'D' },
  { value: 3, label: 'Neutral', shortLabel: 'N' },
  { value: 4, label: 'Agree', shortLabel: 'A' },
  { value: 5, label: 'Strongly Agree', shortLabel: 'SA' },
];

type TestState = 'intro' | 'questions' | 'complete';

export default function WellnessTestPage() {
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
    setAnswers({ ...answers, [wellnessQuestions[currentQuestion].id]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < wellnessQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final scores
      const categoryScores: Record<string, number> = {};
      const categoryTotals: Record<string, { total: number; count: number }> = {};
      
      categories.forEach(cat => {
        categoryTotals[cat.id] = { total: 0, count: 0 };
      });

      Object.entries(answers).forEach(([questionId, value]) => {
        const question = wellnessQuestions.find(q => q.id === parseInt(questionId));
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

      // Save to database
      try {
        await fetch('/api/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id?.toString() || '',
          },
          body: JSON.stringify({
            assessmentType: 'wellness',
            answers: answers,
            scores: categoryScores,
            dominantResult: `${overallScore}%`,
            overallScore: overallScore,
          }),
        });
      } catch (error) {
        console.error('Failed to save Wellness results:', error);
      }

      setTestState('complete');
      localStorage.setItem('arise_wellness_results', JSON.stringify(answers));
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleViewResults = () => {
    router.push('/dashboard/wellness/results');
  };

  const calculateScores = () => {
    const scores: Record<string, { total: number; count: number }> = {};
    categories.forEach(cat => {
      scores[cat.id] = { total: 0, count: 0 };
    });

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = wellnessQuestions.find(q => q.id === parseInt(questionId));
      if (question) {
        scores[question.category].total += value;
        scores[question.category].count += 1;
      }
    });

    return Object.entries(scores).map(([category, data]) => ({
      category,
      score: data.count > 0 ? Math.round((data.total / (data.count * 5)) * 100) : 0,
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

  const progress = ((currentQuestion + 1) / wellnessQuestions.length) * 100;
  const currentQ = wellnessQuestions[currentQuestion];
  const currentCategory = categories.find(c => c.id === currentQ?.category);

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
                  <h1 className="text-2xl font-bold text-gray-900">Wellness Assessment</h1>
                  <p className="text-gray-600">Evaluate your holistic well-being</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-8">
                {/* Left side - Info */}
                <div className="flex-1">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Assessment Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {cat.icon} {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold text-gray-900">30 Questions</span>
                      </div>
                      <p className="text-sm text-gray-600">5 per category</p>
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
                        <span className="text-sm text-gray-600">Your wellness balance across 6 dimensions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Areas of strength and growth opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span className="text-sm text-gray-600">Personalized recommendations based on research</span>
                      </li>
                    </ul>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={handleStartTest}
                    className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-lg"
                  >
                    Start Assessment
                  </button>
                </div>

                {/* Right side - Mandala image */}
                <div className="w-64 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-pink-500/50 to-orange-500/50"></div>
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 via-blue-400 to-purple-400 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400"></div>
                        </div>
                      </div>
                    </div>
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
                <span>Question {currentQuestion + 1} of {wellnessQuestions.length}</span>
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
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: currentCategory?.color }}
                >
                  {currentCategory?.icon} {currentCategory?.name}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                {currentQ.text}
              </h2>

              {/* Answer Options */}
              <div className="grid grid-cols-5 gap-3 mb-8">
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
                    <span className={`text-xs text-center ${
                      answers[currentQ.id] === option.value ? 'text-primary-500 font-medium' : 'text-gray-500'
                    }`}>
                      {option.shortLabel}
                    </span>
                  </button>
                ))}
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-gray-500 mb-8 px-2">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
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
                  {currentQuestion === wellnessQuestions.length - 1 ? 'Complete' : 'Next'}
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

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Congratulations Banner */}
          <div className="bg-neutral-800 rounded-xl p-8 text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-gray-300">You have completed the Wellness Assessment</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Overall Wellness Score</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{overallScore}%</span>
              </div>
              <div>
                <p className="text-gray-600">
                  {overallScore >= 80 ? "Excellent! You're maintaining great wellness habits." :
                   overallScore >= 60 ? "Good progress! There's room for improvement in some areas." :
                   "Consider focusing on building healthier habits across categories."}
                </p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Scores by Category</h3>
            <div className="space-y-4">
              {scores.sort((a, b) => b.score - a.score).map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      {categories.find(c => c.id === item.category)?.icon} {item.name}
                    </span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleViewResults}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold transition-colors"
            >
              View Detailed Results
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
