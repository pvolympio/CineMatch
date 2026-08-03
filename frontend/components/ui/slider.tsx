'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  icon,
  className,
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="flex items-center gap-2 text-slate-300">
          {icon && <span className="text-amber-400">{icon}</span>}
          {label}
        </span>
        <span className="font-mono text-amber-400">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-amber-400 transition-all"
      />
    </div>
  );
}
