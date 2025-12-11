'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatCardVariant = 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'teal';

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

/**
 * StatCard component using ARISE Design System tokens
 * Styles are defined in src/styles/cards.css
 */

// Map variant to CSS class
const variantClasses: Record<StatCardVariant, string> = {
  default: 'stat-card',
  blue: 'stat-card-blue',
  green: 'stat-card-green',
  yellow: 'stat-card-yellow',
  purple: 'stat-card-purple',
  red: 'stat-card-red',
  teal: 'stat-card-teal',
};

const iconBgColors: Record<StatCardVariant, string> = {
  default: 'bg-neutral-100',
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  purple: 'bg-purple-100',
  red: 'bg-red-100',
  teal: 'bg-primary-100',
};

const iconColors: Record<StatCardVariant, string> = {
  default: 'text-neutral-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  teal: 'text-primary-600',
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
    <div className={`${variantClasses[variant]} ${className}`.trim()}>
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColors[variant]}`}
          >
            <div className={iconColors[variant]}>{icon}</div>
          </div>
        )}
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositiveTrend ? 'text-success' : 'text-error'
            }`}
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
      <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>

      {/* Title */}
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </p>

      {/* Subtitle / Trend label */}
      {(subtitle || trend?.label) && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {subtitle || trend?.label}
        </p>
      )}
    </div>
  );
}

export type { StatCardProps, StatCardVariant };
