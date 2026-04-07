'use client';

import { useStore } from '@/lib/store';
import { SCORECARD_ITEMS } from '@/lib/constants';
import { scorecardTotal, formatFullDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props { date: string; }

type ScKey = 'awareness' | 'intention' | 'state' | 'presence' | 'ownership' | 'authenticity';

function dotColor(dotPos: number, score: number): string {
  if (dotPos > score) return 'bg-gray-100 dark:bg-slate-700';
  if (score <= 2) return 'bg-red-500';
  if (score <= 3) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function ScorecardTab({ date }: Props) {
  const { entries, updateScorecard } = useStore();
  const sc = entries[date]?.scorecard;
  const total = sc ? scorecardTotal(sc) : 0;
  const pct = Math.round((total / 30) * 100);

  const setScore = (id: ScKey, val: number) => updateScorecard(date, { [id]: val });

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500">
          Daily inner game score
        </span>
        <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{formatFullDate()}</span>
      </div>

      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500">
        Rate today · 1 low → 5 fully lived
      </p>

      <div className="grid grid-cols-2 gap-3">
        {SCORECARD_ITEMS.map((item) => {
          const key = item.id as ScKey;
          const score = sc?.[key] || 0;
          return (
            <div key={item.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3.5">
              <p className="text-[12px] font-medium text-gray-900 dark:text-white mb-1">{item.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-snug mb-3">{item.desc}</p>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScore(key, v)}
                    className={cn(
                      'flex-1 h-[5px] rounded-full transition-all duration-200',
                      dotColor(v, score)
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-gray-100 dark:bg-slate-800" />

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-gray-500 dark:text-slate-400">Today&apos;s total</span>
        <div>
          <span className="text-[22px] font-medium text-gray-900 dark:text-white">{total}</span>
          <span className="text-[13px] text-gray-400 dark:text-slate-500"> / 30</span>
        </div>
      </div>
      <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <button
        onClick={() => updateScorecard(date, { completed: true })}
        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[14px] font-medium transition-all hover:opacity-90"
      >
        What should I focus on tomorrow? →
      </button>
    </div>
  );
}
