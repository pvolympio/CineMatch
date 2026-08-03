'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer select-none',
              isActive
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            {tab.icon && <span className="w-4 h-4 flex items-center justify-center">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
