'use client';

import { useStore } from '@/lib/store';

export function ThemeToggle() {
  const { profile, setTheme } = useStore();
  const isDark = profile.theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 bg-gray-200 dark:bg-slate-600 flex items-center"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center text-[10px] ${
          isDark ? 'translate-x-[26px]' : 'translate-x-[2px]'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
