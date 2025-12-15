'use client';

import { Info } from 'lucide-react';

interface FeedbackBannerProps {
  onAddEvaluators?: () => void;
}

export default function FeedbackBanner({ onAddEvaluators }: FeedbackBannerProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-primary-500" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Add Your 360° Feedback Evaluators</h4>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Get comprehensive feedback by inviting colleagues to evaluate your leadership.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-gray-500 text-base sm:text-lg" aria-hidden="true">👤</span>
          </div>
        </div>
        <button
          onClick={onAddEvaluators}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-600 transition-colors flex-1 sm:flex-initial whitespace-nowrap"
          aria-label="Add evaluators for 360° feedback"
        >
          Add evaluators
        </button>
      </div>
    </div>
  );
}
