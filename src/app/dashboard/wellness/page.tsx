'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

const categories = [
  { id: 'physical', name: 'Physical', color: '#0D5C5C' },
  { id: 'mental', name: 'Mental', color: '#D4A84B' },
  { id: 'emotional', name: 'Emotional', color: '#8B5CF6' },
  { id: 'spiritual', name: 'Spiritual', color: '#EC4899' },
];

const questions = [
  // Physical questions
  { id: 1, category: 'physical', text: 'I engage in regular physical activity', subtext: 'Exercise at least 3x/week' },
  { id: 2, category: 'physical', text: 'My sleep is restorative and sufficient', subtext: '7-9 hours of quality sleep' },
  { id: 3, category: 'physical', text: 'I eat a balanced and healthy diet', subtext: 'Nutritious meals regularly' },
  { id: 4, category: 'physical', text: 'I maintain a healthy body weight', subtext: 'Within recommended BMI range' },
  { id: 5, category: 'physical', text: 'I have regular health check-ups', subtext: 'Annual medical examinations' },
  // Mental questions
  { id: 6, category: 'mental', text: 'I can focus and concentrate effectively', subtext: 'Sustained attention on tasks' },
  { id: 7, category: 'mental', text: 'I continuously learn new things', subtext: 'Personal growth and development' },
  { id: 8, category: 'mental', text: 'I manage stress effectively', subtext: 'Healthy coping mechanisms' },
  { id: 9, category: 'mental', text: 'I have clear goals and direction', subtext: 'Purpose-driven activities' },
  { id: 10, category: 'mental', text: 'I practice mindfulness regularly', subtext: 'Present moment awareness' },
  // Emotional questions
  { id: 11, category: 'emotional', text: 'I can identify and express my emotions', subtext: 'Emotional awareness' },
  { id: 12, category: 'emotional', text: 'I maintain healthy relationships', subtext: 'Supportive connections' },
  { id: 13, category: 'emotional', text: 'I practice self-compassion', subtext: 'Kind to myself in difficulties' },
  { id: 14, category: 'emotional', text: 'I can manage difficult emotions', subtext: 'Emotional regulation' },
  { id: 15, category: 'emotional', text: 'I feel a sense of belonging', subtext: 'Connected to community' },
  // Spiritual questions
  { id: 16, category: 'spiritual', text: 'I have a sense of purpose in life', subtext: 'Meaning and direction' },
  { id: 17, category: 'spiritual', text: 'I practice gratitude regularly', subtext: 'Appreciating what I have' },
  { id: 18, category: 'spiritual', text: 'I feel connected to something greater', subtext: 'Transcendent experiences' },
  { id: 19, category: 'spiritual', text: 'I live according to my values', subtext: 'Authentic living' },
  { id: 20, category: 'spiritual', text: 'I take time for reflection', subtext: 'Inner contemplation' },
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setTestState('complete');
      // Save results to localStorage
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentCategoryColor = categories.find(c => c.id === currentQ?.category)?.color || '#0D5C5C';

  // Intro Screen
  if (testState === 'intro') {
    return (
      <div className="min-h-screen bg-[#0D5C5C]">
        <div className="flex">
          <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
          
          <main className="flex-1 p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Wellness Assessment</h1>
                <p className="text-gray-500 mt-1">Evaluate your holistic well-being across four key dimensions</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex gap-8">
                  {/* Left side - Info */}
                  <div className="flex-1">
                    {/* Categories */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Assessment Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              selectedCategory === cat.id
                                ? 'bg-[#0D5C5C] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time estimate */}
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">15-20 minutes</span>
                    </div>

                    {/* What you'll discover */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">What you&apos;ll discover</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0D5C5C] mt-0.5" />
                          <span className="text-sm text-gray-600">Your wellness balance across 4 dimensions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0D5C5C] mt-0.5" />
                          <span className="text-sm text-gray-600">Areas of strength and growth opportunities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0D5C5C] mt-0.5" />
                          <span className="text-sm text-gray-600">Personalized recommendations</span>
                        </li>
                      </ul>
                    </div>

                    {/* Start button */}
                    <button
                      onClick={handleStartTest}
                      className="w-full py-3 bg-[#D4A84B] text-[#0D5C5C] font-semibold rounded-lg hover:bg-[#c49a42] transition-colors"
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
      </div>
    );
  }

  // Questions Screen
  if (testState === 'questions') {
    return (
      <div className="min-h-screen bg-[#0D5C5C]">
        <div className="flex">
          <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
          
          <main className="flex-1 p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              {/* Progress bar */}
              <div className="h-2 bg-gray-100">
                <div 
                  className="h-full bg-[#D4A84B] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: currentCategoryColor }}
                    >
                      {currentQuestion + 1}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {currentQ.category}
                      </span>
                      <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                    Save & Exit
                  </Link>
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentQ.text}</h2>
                  <p className="text-gray-500">{currentQ.subtext}</p>
                </div>

                {/* Answer options */}
                <div className="flex justify-center gap-4 mb-8">
                  {answerOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[100px] ${
                        answers[currentQ.id] === option.value
                          ? 'border-[#0D5C5C] bg-[#0D5C5C]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-lg font-bold mb-1 ${
                        answers[currentQ.id] === option.value ? 'text-[#0D5C5C]' : 'text-gray-700'
                      }`}>
                        {option.shortLabel}
                      </span>
                      <span className="text-xs text-gray-500 text-center">{option.label}</span>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestion === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentQ.id]}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      answers[currentQ.id]
                        ? 'bg-[#0D5C5C] text-white hover:bg-[#0a4a4a]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Complete Screen
  return (
    <div className="min-h-screen bg-[#0D5C5C]">
      <div className="flex">
        <Sidebar user={user} activePage="assessments" onLogout={handleLogout} />
        
        <main className="flex-1 p-6">
          <div className="bg-[#2D2D2D] rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="p-12 text-center">
              {/* Checkmark */}
              <div className="w-20 h-20 rounded-full bg-[#D4A84B] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">Congratulations!</h1>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                You have successfully completed the Wellness Assessment. Your results are ready to view.
              </p>

              <button
                onClick={handleViewResults}
                className="px-8 py-3 bg-[#D4A84B] text-[#0D5C5C] font-semibold rounded-lg hover:bg-[#c49a42] transition-colors"
              >
                View my results
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
