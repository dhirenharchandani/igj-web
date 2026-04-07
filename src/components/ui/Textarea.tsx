'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      {hint && <p className="text-xs text-slate-500 italic">{hint}</p>}
      <textarea
        className={cn(
          'w-full rounded-xl bg-slate-700/50 border border-slate-600/50 px-4 py-3 text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
          'resize-none transition-all duration-200',
          className
        )}
        rows={3}
        {...props}
      />
    </div>
  );
}
