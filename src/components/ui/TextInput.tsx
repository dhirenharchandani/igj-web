'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextInput({ label, className, ...props }: TextInputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input
        type="text"
        className={cn(
          'w-full rounded-xl bg-slate-700/50 border border-slate-600/50 px-4 py-3 text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
    </div>
  );
}
