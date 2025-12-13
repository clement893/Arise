'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Card, LoadingPage } from '@/components/ui';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

// TKI Question type
interface TKIQuestion {
  pair: number;
  statement_a: string;
  statement_b: string;
  mode_a: string;
  mode_b: string;
}

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
  const [tkiQuestions, setTkiQuestions] = useState<TKIQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [hasProgress, setHasProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      console.log('TKI: Starting to load questions...');
      try {
        const response = await fetch('/api/assessments/tki/questions');
        console.log('TKI: API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('TKI: Questions data received:', data);
          const questions: TKIQuestion[] = (data.questions || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((q: any) => {
              try {
                const parsed = JSON.parse(q.text);
                return {
                  pair: parsed.pair,
                  statement_a: parsed.statement_a,
                  statement_b: parsed.statement_b,
                  mode_a: parsed.mode_a,
                  mode_b: parsed.mode_b,
                };
              } catch (e) {
                console.error('TKI: Failed to parse question:', q, e);
                return null;
              }
            })
            .filter((q: TKIQuestion | null) => q !== null) as TKIQuestion[];
          console.log('TKI: Parsed questions:', questions.length);
          setTkiQuestions(questions);
        } else {
          const errorText = await response.text();
          console.error('TKI: Failed to load questions:', response.status, errorText);
        }
      } catch (error) {
        console.error('TKI: Failed to load questions:', error);
      }
    };
    loadQuestions();
  }, []);

  // Load user and check for existing progress
  useEffect(() => {
    console.log('TKI: Loading user, questions length:', tkiQuestions.length, 'loading:', loading);
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (tkiQuestions.length > 0) {
          console.log('TKI: Questions available, checking progress...');
          checkExistingProgress(userData.id);
        } else {
          console.log('TKI: No questions yet, waiting...');
          // Don't set loading to false here, wait for questions to load
        }
      } catch {
        router.push('/signup');
      }
    } else {
      router.push('/signup');
    }
  }, [router, tkiQuestions.length]);

  // Check if user has existing progress for this assessment
  const checkExistingProgress = async (userId: number) => {
    console.log('TKI: Checking existing progress for user:', userId);
    try {
      const accessToken = localStorage.getItem('arise_access_token');
      const response = await fetch('/api/assessments/progress?type=tki', {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('TKI: Progress data:', data);
        if (data.progress) {
          setHasProgress(true);
          setCurrentQuestion(data.progress.currentQuestion || 0);
          setAnswers(data.progress.answers || {});
        }
      }
    } catch (error) {
      console.error('TKI: Failed to check progress:', error);
    } finally {
      console.log('TKI: Setting loading to false');
      setLoading(false);
    }
  };

  // Save progress to database
  const saveProgress = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem('arise_access_token');
      await fetch('/api/assessments/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          assessmentType: 'tki',
          currentQuestion,
          answers,
          totalQuestions: tkiQuestions.length,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete progress when assessment is completed
  const deleteProgress = async () => {
    if (!user) return;
    try {
      const accessToken = localStorage.getItem('arise_access_token');
      await fetch('/api/assessments/progress?type=tki', {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
    } catch (error) {
      console.error('Failed to delete progress:', error);
    }
  };

  // Auto-save progress when answers change
  useEffect(() => {
    if (currentStep === 'questions' && Object.keys(answers).length > 0) {
      const timeoutId = setTimeout(() => saveProgress(), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [answers, currentQuestion, currentStep]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleAnswer = (choice: 'A' | 'B') => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: choice }));
  };

  const handleNext = async () => {
    if (currentQuestion < tkiQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const finalScores = calculateScores();
      const dominant = getDominantMode(finalScores);
      const maxScore = Math.max(...Object.values(finalScores));
      const overallScore = Math.round((maxScore / 12) * 100);

      try {
        console.log('Saving TKI assessment - Dominant:', dominant, 'Overall score:', overallScore);
        
        const { authenticatedFetch } = await import('@/lib/token-refresh');
        const response = await authenticatedFetch('/api/assessments', {
          method: 'POST',
          body: JSON.stringify({
            assessmentType: 'tki',
            answers: answers,
            scores: finalScores,
            dominantResult: dominant,
            overallScore: overallScore,
          }),
        });

        console.log('TKI save response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to save TKI results:', errorData);
          throw new Error(errorData.error || 'Failed to save assessment');
        }

        const savedData = await response.json();
        console.log('TKI assessment saved successfully:', savedData);
        
        // Delete progress since test is completed
        await deleteProgress();
      } catch (error) {
        console.error('Failed to save TKI results:', error);
        alert('Erreur lors de la sauvegarde des résultats. Veuillez réessayer.');
      }

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

  if (loading || tkiQuestions.length === 0) {
    return <LoadingPage />;
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

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TKI Assessment</h1>
            <p className="text-gray-600">Thomas-Kilmann Conflict Mode Instrument</p>
          </div>
        </div>

        {/* Introduction Step */}
        {currentStep === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Conflict Style Assessment</h2>
                <p className="text-gray-600">Discover your preferred approach to handling conflict</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <Card variant="bordered" className="p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📊</span>
                    <span className="font-semibold text-gray-900">30 Questions</span>
                  </div>
                  <p className="text-sm text-gray-600">Paired statements to choose from</p>
                </Card>
                <Card variant="bordered" className="p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏱️</span>
                    <span className="font-semibold text-gray-900">10-15 Minutes</span>
                  </div>
                  <p className="text-sm text-gray-600">Estimated completion time</p>
                </Card>
                <Card variant="bordered" className="p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold text-gray-900">5 Conflict Styles</span>
                  </div>
                  <p className="text-sm text-gray-600">Competing, Collaborating, Compromising, Avoiding, Accommodating</p>
                </Card>
                <Card variant="bordered" className="p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <span className="font-semibold text-gray-900">Instant Results</span>
                  </div>
                  <p className="text-sm text-gray-600">Get your dominant style immediately</p>
                </Card>
              </div>

              <div className="bg-[#e8f4f4] rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-primary-500 mb-2">Instructions</h3>
                <p className="text-sm text-gray-700">
                  For each pair of statements, choose the one (A or B) that best describes your typical behavior in conflict situations. 
                  There are no right or wrong answers - respond based on how you actually behave, not how you think you should behave.
                </p>
              </div>

              {/* Show Continue button if there's existing progress */}
              {hasProgress ? (
                <div className="space-y-4">
                  <div className="bg-secondary-500/10 border border-secondary-500 rounded-lg p-4 mb-4">
                    <p className="text-secondary-600 font-medium text-center">
                      You have an assessment in progress ({Object.keys(answers).length}/{tkiQuestions.length} questions answered)
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={() => setCurrentStep('questions')}
                    >
                      Continue Assessment
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      size="lg"
                      onClick={() => {
                        setAnswers({});
                        setCurrentQuestion(0);
                        setHasProgress(false);
                        deleteProgress();
                        setCurrentStep('questions');
                      }}
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => setCurrentStep('questions')}
                >
                  Start Assessment
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && (
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {tkiQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Card className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
                Which statement best describes your behavior in conflict situations?
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {/* Option A */}
                <button
                  onClick={() => handleAnswer('A')}
                  className={`w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion] === 'A'
                      ? 'border-primary-500 bg-[#e8f4f4]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${
                      answers[currentQuestion] === 'A'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      A
                    </div>
                    <p className="text-base sm:text-lg text-gray-800">{tkiQuestions[currentQuestion].statement_a}</p>
                  </div>
                </button>

                {/* Option B */}
                <button
                  onClick={() => handleAnswer('B')}
                  className={`w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion] === 'B'
                      ? 'border-primary-500 bg-[#e8f4f4]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${
                      answers[currentQuestion] === 'B'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      B
                    </div>
                    <p className="text-base sm:text-lg text-gray-800">{tkiQuestions[currentQuestion].statement_b}</p>
                  </div>
                </button>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  leftIcon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]}
                  rightIcon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto"
                >
                  {currentQuestion === tkiQuestions.length - 1 ? 'View Results' : 'Next'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <div className="max-w-4xl mx-auto">
            {/* Congratulations Banner */}
            <div className="bg-neutral-800 rounded-xl p-8 text-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
              <p className="text-gray-300">You have completed the TKI Assessment</p>
            </div>

            {/* Dominant Style */}
            <Card className="p-8 mb-6">
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
            </Card>

            {/* All Scores */}
            <Card className="p-8 mb-6">
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
            </Card>

            {/* Style Descriptions */}
            <Card className="p-8 mb-6">
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
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => router.push('/dashboard/results')}
              >
                View All Results
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
