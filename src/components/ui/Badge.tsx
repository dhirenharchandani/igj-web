'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  active?: boolean;
  colorClass?: string;
  onClick?: () => void;
}

export function Badge({ label, active, colorClass, onClick }: BadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 capitalize',
        active ? colorClass : 'bg-slate-700/30 text-slate-500 border-slate-600/30 hover:bg-slate-700/50'
      )}
    >
      {label}
    </button>
  );
}
