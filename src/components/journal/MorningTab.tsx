'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MORNING_QUESTIONS } from '@/lib/constants';
import { cn, formatFullDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { date: string; }

export function MorningTab({ date }: Props) {
  const { entries, updateMorning, setInsight } = useStore();
  const entry = entries[date];
  const m = entry?.morning;
  const [loadingInsight, setLoadingInsight] = useState(false);

  const update = (field: string, value: string) => updateMorning(date, { [field]: value } as never);

  const updateGratitude = (i: number, val: string) => {
    const g: [string, string, string] = [...(m?.gratitude || ['', '', ''])] as [string, string, string];
    g[i] = val;
    updateMorning(date, { gratitude: g });
  };

  const handleGetInsight = async () => {
    if (!m) return;
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'morning', data: m }),
      });
      const json = await res.json();
      if (json.insight) {
        setInsight(date, 'morning', json.insight);
        updateMorning(date, { completed: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  const baseInput = cn(
    'w-full bg-transparent border-b border-gray-200 dark:border-slate-700 pb-2 pt-1',
    'text-[15px] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600',
    'focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors'
  );

  const textareaClass = cn(
    'w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-xl px-3 py-2.5',
    'text-[13px] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600',
    'resize-none focus:outline-none focus:border-gray-400 dark:focus:border-slate-500 transition-colors min-h-[52px]'
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Date + intention */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500">
            Today&apos;s intention
          </span>
          <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{formatFullDate()}</span>
        </div>
        <input
          type="text"
          value={m?.intention || ''}
          onChange={(e) => update('intention', e.target.value)}
          placeholder="Today's message to myself..."
          className={baseInput}
        />
      </div>

      {/* Gratitude */}
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500 mb-1">Gratitude</p>
        <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-snug mb-3">
          What&apos;s already working in my life that I&apos;m not giving enough credit to...
        </p>
        {[0,1,2].map((i) => (
          <div key={i} className="flex items-center gap-2.5 mb-2 last:mb-0">
            <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500 w-3.5">{i+1}</span>
            <input
              type="text"
              value={m?.gratitude?.[i] || ''}
              onChange={(e) => updateGratitude(i, e.target.value)}
              placeholder="..."
              className="flex-1 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 rounded-lg px-3 py-2 text-[13px] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-gray-400 dark:focus:border-slate-500"
            />
          </div>
        ))}
      </div>

      {/* Morning questions */}
      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500 mb-4">
          Morning check-in
        </p>
        <div className="space-y-5">
          {MORNING_QUESTIONS.map((q) => (
            <div key={q.id}>
              <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1">{q.num}</p>
              <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-snug mb-2">{q.text}</p>
              <textarea
                value={(m as unknown as Record<string, string>)?.[q.id] || ''}
                onChange={(e) => update(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={2}
                className={textareaClass}
              />
              {/* Pre-decide block after q4 */}
              {q.id === 'q4' && (
                <div className="mt-2">
                  <div className="bg-gray-50 dark:bg-slate-800/50 border-l-[3px] border-gray-900 dark:border-white rounded-r-xl px-3 py-2 mb-2 text-[12px] italic text-gray-500 dark:text-slate-400">
                    ...and how my grounded self handles it:
                  </div>
                  <textarea
                    value={m?.q4_response || ''}
                    onChange={(e) => update('q4_response', e.target.value)}
                    placeholder="Pre-decide your response."
                    rows={2}
                    className={textareaClass}
                  />
                </div>
              )}
              {q.id === 'q3' && <div className="h-px bg-gray-100 dark:bg-slate-800 mt-4" />}
              {q.id === 'q7' && <div className="h-px bg-gray-100 dark:bg-slate-800 mt-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      <AnimatePresence>
        {m?.insight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-slate-800/50 border-l-[3px] border-gray-900 dark:border-slate-300 rounded-r-2xl px-4 py-4"
          >
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-gray-400 dark:text-slate-500 mb-2">
              Your morning insight
            </p>
            <p className="text-[14px] text-gray-900 dark:text-white leading-relaxed italic">{m.insight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleGetInsight}
        disabled={loadingInsight}
        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[14px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
      >
        {loadingInsight ? 'Getting your insight...' : m?.insight ? 'Refresh insight →' : 'Get my morning insight →'}
      </button>
    </div>
  );
}
