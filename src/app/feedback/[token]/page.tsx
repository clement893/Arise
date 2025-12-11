'use client';

import { Button, Card, CardContent, Badge, LoadingPage } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface EvaluatorInfo {
  id: number;
  name: string;
  relationship: string;
  userName: string;
  status: string;
}

// 360° Feedback Questions - Same as self-assessment but phrased for external evaluator
const feedbackQuestions = [
  // Communication (5 questions)
  { id: 1, category: 'Communication', text: 'Communicates ideas clearly and effectively' },
  { id: 2, category: 'Communication', text: 'Listens actively and shows genuine interest in others\' perspectives' },
  { id: 3, category: 'Communication', text: 'Provides constructive and timely feedback' },
  { id: 4, category: 'Communication', text: 'Adapts communication style to different audiences' },
  { id: 5, category: 'Communication', text: 'Encourages open dialogue and diverse viewpoints' },
  
  // Team Culture (5 questions)
  { id: 6, category: 'Team Culture', text: 'Builds trust and psychological safety within the team' },
  { id: 7, category: 'Team Culture', text: 'Recognizes and celebrates team achievements' },
  { id: 8, category: 'Team Culture', text: 'Promotes collaboration over competition' },
  { id: 9, category: 'Team Culture', text: 'Creates an inclusive environment where everyone feels valued' },
  { id: 10, category: 'Team Culture', text: 'Supports team members\' professional development' },
  
  // Leadership Style (5 questions)
  { id: 11, category: 'Leadership Style', text: 'Leads by example and demonstrates integrity' },
  { id: 12, category: 'Leadership Style', text: 'Empowers others to make decisions' },
  { id: 13, category: 'Leadership Style', text: 'Provides clear direction and vision' },
  { id: 14, category: 'Leadership Style', text: 'Holds themselves and others accountable' },
  { id: 15, category: 'Leadership Style', text: 'Inspires and motivates the team' },
  
  // Change Management (5 questions)
  { id: 16, category: 'Change Management', text: 'Embraces and adapts to change effectively' },
  { id: 17, category: 'Change Management', text: 'Helps others navigate through transitions' },
  { id: 18, category: 'Change Management', text: 'Communicates the reasons and benefits of changes' },
  { id: 19, category: 'Change Management', text: 'Remains calm and focused during uncertainty' },
  { id: 20, category: 'Change Management', text: 'Seeks innovative solutions to challenges' },
  
  // Problem Solving (5 questions)
  { id: 21, category: 'Problem Solving', text: 'Analyzes problems thoroughly before acting' },
  { id: 22, category: 'Problem Solving', text: 'Makes timely and well-informed decisions' },
  { id: 23, category: 'Problem Solving', text: 'Considers multiple perspectives when solving problems' },
  { id: 24, category: 'Problem Solving', text: 'Takes ownership of mistakes and learns from them' },
  { id: 25, category: 'Problem Solving', text: 'Balances short-term needs with long-term goals' },
  
  // Stress Management (5 questions)
  { id: 26, category: 'Stress Management', text: 'Maintains composure under pressure' },
  { id: 27, category: 'Stress Management', text: 'Manages workload effectively without burnout' },
  { id: 28, category: 'Stress Management', text: 'Supports team members during stressful periods' },
  { id: 29, category: 'Stress Management', text: 'Promotes work-life balance' },
  { id: 30, category: 'Stress Management', text: 'Handles conflicts constructively' },
];

const ratingLabels = [
  { value: 1, label: 'Never/Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Usually' },
  { value: 5, label: 'Almost Always' },
];

const categories = ['Communication', 'Team Culture', 'Leadership Style', 'Change Management', 'Problem Solving', 'Stress Management'];

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [evaluatorInfo, setEvaluatorInfo] = useState<EvaluatorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchEvaluatorInfo = async () => {
      try {
        const response = await fetch(`/api/feedback/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Invalid or expired feedback link');
          setIsLoading(false);
          return;
        }
        
        if (data.evaluator.status === 'completed') {
          setIsCompleted(true);
        }
        
        setEvaluatorInfo(data.evaluator);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load feedback form');
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEvaluatorInfo();
    }
  }, [token]);

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = feedbackQuestions.filter(q => q.category === currentCategory);
  
  const categoryAnsweredCount = currentQuestions.filter(q => answers[q.id] !== undefined).length;
  const allCategoryAnswered = categoryAnsweredCount === currentQuestions.length;
  
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / feedbackQuestions.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (totalAnswered < feedbackQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/feedback/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        setIsCompleted(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Not Valid</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#f0f5f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">
            Your feedback for <strong>{evaluatorInfo?.userName}</strong> has been successfully submitted.
          </p>
          <p className="text-sm text-gray-500">
            Your honest insights will help them understand their leadership strengths and identify areas for growth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5f5]">
      {/* Header */}
      <header className="bg-primary-500 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">ARISE</h1>
              <p className="text-secondary-500 text-sm">360° Feedback</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Feedback for</p>
              <p className="font-semibold">{evaluatorInfo?.userName}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{totalAnswered} of {feedbackQuestions.length} questions</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 py-8">
        {/* Category Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat, index) => {
            const catQuestions = feedbackQuestions.filter(q => q.category === cat);
            const catAnswered = catQuestions.filter(q => answers[q.id] !== undefined).length;
            const isComplete = catAnswered === catQuestions.length;
            
            return (
              <button
                key={cat}
                onClick={() => setCurrentCategoryIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  index === currentCategoryIndex
                    ? 'bg-primary-500 text-white'
                    : isComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
                {isComplete && <CheckCircle className="w-4 h-4 inline ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-primary-500 mb-6">{currentCategory}</h2>
          
          <div className="space-y-8">
            {currentQuestions.map((question, qIndex) => (
              <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <p className="text-gray-800 mb-4">
                  <span className="text-primary-500 font-medium mr-2">{qIndex + 1}.</span>
                  {question.text}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {ratingLabels.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleAnswer(question.id, rating.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        answers[question.id] === rating.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rating.value} - {rating.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentCategoryIndex === categories.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={totalAnswered < feedbackQuestions.length || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Anonymous Notice */}
        <div className="mt-8 p-4 bg-primary-500/5 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            <strong>Your responses are anonymous.</strong> Individual feedback will be aggregated with other evaluators' responses.
          </p>
        </div>
      </main>
    </div>
  );
}
