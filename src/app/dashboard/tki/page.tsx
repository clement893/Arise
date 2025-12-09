'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

// TKI Questions - 30 pairs from the ARISE assessment
const tkiQuestions = [
  { pair: 1, statement_a: "I press to get my points across", statement_b: "I try to investigate an issue to find a mutually acceptable solution.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 2, statement_a: "I generally pursue my goals firmly.", statement_b: "I try to postpone the issue until I can properly reflect about it", mode_a: "Competing", mode_b: "Avoiding" },
  { pair: 3, statement_a: "I attempt to postpone the issue until I've had some time to think it over.", statement_b: "I give up some points in exchange for others.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 4, statement_a: "I try to win my position.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 5, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to do what is necessary to avoid useless tensions.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 6, statement_a: "I am firm in pursuing my goals.", statement_b: "I try to find a compromise solution.", mode_a: "Competing", mode_b: "Compromising" },
  { pair: 7, statement_a: "I try to find a middle ground.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 8, statement_a: "I sometimes avoid taking positions that would create controversy.", statement_b: "I will let the other person have some of their positions if they let me have some of mine.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 9, statement_a: "I suggest a middle ground.", statement_b: "I press to get my points made.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 10, statement_a: "I might try to soothe the other's feelings and preserve our relationship.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 11, statement_a: "I attempt to get all concerns out in the open.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 12, statement_a: "I try to win my position.", statement_b: "Rather than negotiate on things we both disagree, I prefer to stress those things upon which we both agree.", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 13, statement_a: "I give up some points in exchange for others.", statement_b: "I try to postpone the issue until I have time to think about it.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 14, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to find a compromise solution.", mode_a: "Collaborating", mode_b: "Compromising" },
  { pair: 15, statement_a: "I feel that differences are not always worth worrying about.", statement_b: "I make some effort to get my way.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 16, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Accommodating", mode_b: "Collaborating" },
  { pair: 17, statement_a: "I try to find a compromise solution.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Accommodating" },
  { pair: 18, statement_a: "I am usually firm in pursuing my goals.", statement_b: "I try to find a solution that satisfies both of us.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 19, statement_a: "I propose a middle ground.", statement_b: "I am frequently concerned with satisfying all wishes.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 20, statement_a: "I will let the other person have some of their positions if they let me have some of mine.", statement_b: "I attempt to deal with all their and my concerns.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 21, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I generally pursue my goals firmly.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 22, statement_a: "I attempt to postpone the issue until I have had some time to think it over.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 23, statement_a: "I try to find a compromise solution.", statement_b: "I try to win my position.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 24, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I sometimes sacrifice my own wishes for the wishes of the other person.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 25, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Collaborating", mode_b: "Competing" },
  { pair: 26, statement_a: "I try to find a middle ground.", statement_b: "I try to get the other person to settle for a compromise.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 27, statement_a: "I attempt to get all concerns and issues immediately out in the open.", statement_b: "I attempt to postpone the issue until I've had some time to think it over.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 28, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I try to win my position.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 29, statement_a: "I give up some points in exchange for others.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 30, statement_a: "I try to find a solution that satisfies both of us.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Collaborating", mode_b: "Accommodating" },
];

type TKIMode = 'Competing' | 'Collaborating' | 'Compromising' | 'Avoiding' | 'Accommodating';

const modeDescriptions: Record<TKIMode, { title: string; description: string; color: string }> = {
  Competing: {
    title: "Competing",
    description: "You pursue your own concerns at the other person's expense. This is a power-oriented mode where you use whatever power seems appropriate to win your position.",
    color: "#e74c3c"
  },
  Collaborating: {
    title: "Collaborating", 
    description: "You work with the other person to find a solution that fully satisfies both parties. This involves digging into an issue to identify underlying concerns.",
    color: "#27ae60"
  },
  Compromising: {
    title: "Compromising",
    description: "You find an expedient, mutually acceptable solution that partially satisfies both parties. You give up more than competing but less than accommodating.",
    color: "#f39c12"
  },
  Avoiding: {
    title: "Avoiding",
    description: "You don't immediately pursue your own concerns or those of the other person. You sidestep the conflict, postpone it, or simply withdraw.",
    color: "#9b59b6"
  },
  Accommodating: {
    title: "Accommodating",
    description: "You neglect your own concerns to satisfy the concerns of the other person. You might selflessly yield to another's point of view.",
    color: "#3498db"
  }
};

export default function TKITestPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});

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

  const handleAnswer = (choice: 'A' | 'B') => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: choice }));
  };

  const handleNext = () => {
    if (currentQuestion < tkiQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCurrentStep('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScores = (): Record<TKIMode, number> => {
    const scores: Record<TKIMode, number> = {
      Competing: 0,
      Collaborating: 0,
      Compromising: 0,
      Avoiding: 0,
      Accommodating: 0
    };

    Object.entries(answers).forEach(([questionIndex, choice]) => {
      const question = tkiQuestions[parseInt(questionIndex)];
      const selectedMode = choice === 'A' ? question.mode_a : question.mode_b;
      scores[selectedMode as TKIMode]++;
    });

    return scores;
  };

  const getDominantMode = (scores: Record<TKIMode, number>): TKIMode => {
    let maxScore = 0;
    let dominantMode: TKIMode = 'Compromising';
    
    Object.entries(scores).forEach(([mode, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantMode = mode as TKIMode;
      }
    });

    return dominantMode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const progress = ((currentQuestion + 1) / tkiQuestions.length) * 100;
  const scores = calculateScores();
  const dominantMode = getDominantMode(scores);

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TKI Assessment</h1>
            <p className="text-gray-600">Thomas-Kilmann Conflict Mode Instrument</p>
          </div>
        </div>

        {/* Introduction Step */}
        {currentStep === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#0D5C5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Conflict Style Assessment</h2>
                <p className="text-gray-600">Discover your preferred approach to handling conflict</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📊</span>
                    <span className="font-semibold text-gray-900">30 Questions</span>
                  </div>
                  <p className="text-sm text-gray-600">Paired statements to choose from</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏱️</span>
                    <span className="font-semibold text-gray-900">10-15 Minutes</span>
                  </div>
                  <p className="text-sm text-gray-600">Estimated completion time</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold text-gray-900">5 Conflict Styles</span>
                  </div>
                  <p className="text-sm text-gray-600">Competing, Collaborating, Compromising, Avoiding, Accommodating</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <span className="font-semibold text-gray-900">Instant Results</span>
                  </div>
                  <p className="text-sm text-gray-600">Get your dominant style immediately</p>
                </div>
              </div>

              <div className="bg-[#e8f4f4] rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-[#0D5C5C] mb-2">Instructions</h3>
                <p className="text-sm text-gray-700">
                  For each pair of statements, choose the one (A or B) that best describes your typical behavior in conflict situations. 
                  There are no right or wrong answers - respond based on how you actually behave, not how you think you should behave.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('questions')}
                className="w-full bg-[#0D5C5C] hover:bg-[#0a4a4a] text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Start Assessment
              </button>
            </div>
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {tkiQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0D5C5C] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Which statement best describes your behavior in conflict situations?
              </h2>

              <div className="space-y-4 mb-8">
                {/* Option A */}
                <button
                  onClick={() => handleAnswer('A')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion] === 'A'
                      ? 'border-[#0D5C5C] bg-[#e8f4f4]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestion] === 'A'
                        ? 'bg-[#0D5C5C] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      A
                    </div>
                    <p className="text-gray-800 text-lg">{tkiQuestions[currentQuestion].statement_a}</p>
                  </div>
                </button>

                {/* Option B */}
                <button
                  onClick={() => handleAnswer('B')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion] === 'B'
                      ? 'border-[#0D5C5C] bg-[#e8f4f4]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestion] === 'B'
                        ? 'bg-[#0D5C5C] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      B
                    </div>
                    <p className="text-gray-800 text-lg">{tkiQuestions[currentQuestion].statement_b}</p>
                  </div>
                </button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestion === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !answers[currentQuestion]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0D5C5C] text-white hover:bg-[#0a4a4a]'
                  }`}
                >
                  {currentQuestion === tkiQuestions.length - 1 ? 'View Results' : 'Next'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <div className="max-w-4xl mx-auto">
            {/* Congratulations Banner */}
            <div className="bg-[#2D2D2D] rounded-xl p-8 text-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-[#D4A84B] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
              <p className="text-gray-300">You have completed the TKI Assessment</p>
            </div>

            {/* Dominant Style */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Dominant Conflict Style</h3>
              <div className="flex items-center gap-6 p-6 rounded-xl" style={{ backgroundColor: `${modeDescriptions[dominantMode].color}15` }}>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: modeDescriptions[dominantMode].color }}
                >
                  {scores[dominantMode]}
                </div>
                <div>
                  <h4 className="text-2xl font-bold" style={{ color: modeDescriptions[dominantMode].color }}>
                    {modeDescriptions[dominantMode].title}
                  </h4>
                  <p className="text-gray-600 mt-2">{modeDescriptions[dominantMode].description}</p>
                </div>
              </div>
            </div>

            {/* All Scores */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Complete Profile</h3>
              <div className="space-y-4">
                {(Object.entries(scores) as [TKIMode, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([mode, score]) => (
                    <div key={mode}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{mode}</span>
                        <span className="font-bold" style={{ color: modeDescriptions[mode].color }}>
                          {score} / 12
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(score / 12) * 100}%`,
                            backgroundColor: modeDescriptions[mode].color
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Style Descriptions */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Understanding the Five Styles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {(Object.entries(modeDescriptions) as [TKIMode, typeof modeDescriptions[TKIMode]][]).map(([mode, info]) => (
                  <div 
                    key={mode} 
                    className="p-4 rounded-lg border border-gray-100"
                    style={{ borderLeftWidth: '4px', borderLeftColor: info.color }}
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard/results')}
                className="flex-1 bg-[#0D5C5C] hover:bg-[#0a4a4a] text-white py-4 rounded-xl font-semibold transition-colors"
              >
                View All Results
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
