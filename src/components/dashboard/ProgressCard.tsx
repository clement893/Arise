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
    <div className="bg-gradient-to-br from-[#0D5C5C] to-[#0a4a4a] rounded-2xl p-6 text-white">
      <div className="flex gap-8">
        {/* Left side - Total Progress */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Your Progress</h3>
          <div className="text-6xl font-bold text-[#4ECDC4] mb-2">
            {totalProgress} %
          </div>
          <p className="text-white/80 text-sm mb-2">
            You are making good progress in your holistic leadership journey.
          </p>
          <p className="font-semibold text-sm mb-4">Keep it up!</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#D4A84B] text-[#0D5C5C] rounded-lg text-sm font-semibold hover:bg-[#c49a42] transition-colors">
              Continue Learning
            </button>
            <button className="px-4 py-2 border border-white/50 text-white rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
              View Reports
            </button>
          </div>
        </div>

        {/* Right side - Progress bars */}
        <div className="flex-1 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-white/90 w-24">{item.label}</span>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4ECDC4] rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              {item.showAdd ? (
                <button className="px-3 py-1 bg-[#4ECDC4] text-[#0D5C5C] rounded text-xs font-semibold hover:bg-[#3dbdb5] transition-colors">
                  Add
                </button>
              ) : (
                <span className="text-sm text-[#4ECDC4] w-12 text-right">{item.percentage} %</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
