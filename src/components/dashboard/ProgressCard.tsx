'use client';

interface ProgressItem {
  label: string;
  percentage: number;
  showAdd?: boolean;
}

interface ProgressCardProps {
  totalProgress: number;
  items: ProgressItem[];
}

export default function ProgressCard({ totalProgress, items }: ProgressCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0D5C5C] to-[#0a4a4a] rounded-2xl p-4 sm:p-6 text-white">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left side - Total Progress */}
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold !text-white mb-2">Your Progress</h3>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4ECDC4] mb-2">
            {totalProgress} %
          </div>
          <p className="text-white/80 text-xs sm:text-sm mb-2">
            You are making good progress in your holistic leadership journey.
          </p>
          <p className="font-semibold text-xs sm:text-sm mb-4">Keep it up!</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button className="px-3 sm:px-4 py-2 bg-[#D4A84B] text-[#0D5C5C] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#c49a42] transition-colors">
              Continue Learning
            </button>
            <button className="px-3 sm:px-4 py-2 border border-white/50 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors">
              View Reports
            </button>
          </div>
        </div>

        {/* Right side - Progress bars */}
        <div className="flex-1 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-white/90 sm:w-24 flex-shrink-0">{item.label}</span>
              <div className="flex-1 w-full sm:w-auto h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4ECDC4] rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                {item.showAdd ? (
                  <button className="px-2 sm:px-3 py-1 bg-[#4ECDC4] text-[#0D5C5C] rounded text-xs font-semibold hover:bg-[#3dbdb5] transition-colors whitespace-nowrap">
                    Add
                  </button>
                ) : (
                  <span className="text-xs sm:text-sm text-[#4ECDC4] sm:w-12 text-right whitespace-nowrap">{item.percentage} %</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
