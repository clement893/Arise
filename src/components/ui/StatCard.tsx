'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatCardVariant = 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'red';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: StatCardVariant;
  className?: string;
}

const iconBgColors: Record<StatCardVariant, string> = {
  default: 'bg-gray-50',
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  yellow: 'bg-yellow-50',
  purple: 'bg-purple-50',
  red: 'bg-red-50',
};

const iconColors: Record<StatCardVariant, string> = {
  default: 'text-gray-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <div
      className={`
        bg-white rounded-xl p-6 shadow-sm border border-gray-100
        ${className}
      `}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${iconBgColors[variant]}
            `}
          >
            <div className={iconColors[variant]}>{icon}</div>
          </div>
        )}
        {trend && (
          <div
            className={`
              flex items-center gap-1 text-sm
              ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}
            `}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900">{value}</p>

      {/* Title */}
      <p className="text-sm text-gray-500">{title}</p>

      {/* Subtitle / Trend label */}
      {(subtitle || trend?.label) && (
        <p className="text-xs text-gray-400 mt-1">
          {subtitle || trend?.label}
        </p>
      )}
    </div>
  );
}

export type { StatCardProps, StatCardVariant };
