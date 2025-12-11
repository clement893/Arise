'use client';

import { ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

interface TabPanelProps {
  children: ReactNode;
  value: string;
  activeValue: string;
}

const variantStyles = {
  default: {
    container: 'flex items-center gap-2',
    tab: {
      base: 'px-4 py-2 rounded-lg font-medium transition-colors',
      active: 'bg-[#0D5C5C] text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  },
  pills: {
    container: 'flex items-center gap-1 p-1 bg-gray-100 rounded-lg',
    tab: {
      base: 'px-4 py-2 rounded-md font-medium transition-colors',
      active: 'bg-white text-[#0D5C5C] shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
  },
  underline: {
    container: 'flex items-center gap-6 border-b border-gray-200',
    tab: {
      base: 'pb-3 font-medium transition-colors border-b-2 -mb-px',
      active: 'text-[#0D5C5C] border-[#0D5C5C]',
      inactive: 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
    },
  },
};

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
}: TabsProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} ${fullWidth ? 'w-full' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            ${styles.tab.base}
            ${sizeStyles[size]}
            ${activeTab === tab.id ? styles.tab.active : styles.tab.inactive}
            ${fullWidth ? 'flex-1' : ''}
            flex items-center justify-center gap-2
          `}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'}
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ children, value, activeValue }: TabPanelProps) {
  if (value !== activeValue) return null;
  return <div>{children}</div>;
}

// Hook for managing tab state
export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return { activeTab, setActiveTab };
}

export type { TabsProps, Tab, TabPanelProps };
