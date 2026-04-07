'use client';

import { cn } from '@/lib/utils';

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const ENERGY_COLORS = [
  'from-red-500 to-red-400',      // 1
  'from-red-400 to-orange-500',    // 2
  'from-orange-500 to-orange-400', // 3
  'from-orange-400 to-amber-500',  // 4
  'from-amber-500 to-yellow-400',  // 5
  'from-yellow-400 to-lime-500',   // 6
  'from-lime-500 to-green-400',    // 7
  'from-green-400 to-emerald-500', // 8
  'from-emerald-500 to-teal-400',  // 9
  'from-teal-400 to-cyan-400',     // 10
];

export function EnergySlider({ value, onChange, label = 'Energy Level' }: EnergySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="relative">
        <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300', ENERGY_COLORS[value - 1])}
            style={{ width: `${value * 10}%` }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
