'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm',
        glow && 'shadow-lg shadow-indigo-500/5 border-indigo-500/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
