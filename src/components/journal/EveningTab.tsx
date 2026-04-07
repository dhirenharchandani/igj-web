'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { EVENING_QUESTIONS } from '@/lib/constants';
import { cn, formatFullDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { date: string; }

export function EveningTab({ date }: Props) {
  const { entries, updateEvening, setInsight } = useStore();
  const entry = entries[date];
  const e = entry?.evening;
  const [loadingInsight, setLoadingInsight] = useState(false);

  const update = (field: string, value: string) => updateEvening(date, { [field]: value } as never);

  const handleGetInsight = async () => {
    if (!e) return;
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'evening', data: e }),
      });
      const json = await res.json();
      if (json.insight) {
        setInsight(date, 'evening', json.insight);
        updateEvening(date, { completed: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const textareaClass = cn(
    'w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-xl px-3 py-2.5',
    'text-[13px] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600',
    'resize-none focus:outline-none focus:border-gray-400 dark:focus:border-slate-500 transition-colors min-h-[52px]'
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500">
          End of day reflection
        </span>
        <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{formatFullDate()}</span>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500 mb-4">
          Evening reflection
        </p>
        <div className="space-y-5">
          {EVENING_QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1">{q.num}</p>
              <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-snug mb-2">{q.text}</p>
              <textarea
                value={(e as unknown as Record<string, string>)?.[q.id] || ''}
                onChange={(ev) => update(q.id, ev.target.value)}
                placeholder={q.placeholder}
                rows={2}
                className={textareaClass}
              />
              {i === 2 && <div className="h-px bg-gray-100 dark:bg-slate-800 mt-4" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {e?.insight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-slate-800/50 border-l-[3px] border-gray-900 dark:border-slate-300 rounded-r-2xl px-4 py-4"
          >
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-gray-400 dark:text-slate-500 mb-2">
              Your evening insight
            </p>
            <p className="text-[14px] text-gray-900 dark:text-white leading-relaxed italic">{e.insight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleGetInsight}
        disabled={loadingInsight}
        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[14px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
      >
        {loadingInsight ? 'Getting your insight...' : e?.insight ? 'Refresh insight →' : 'Get my evening insight →'}
      </button>
    </div>
  );
}
