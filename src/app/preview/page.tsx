'use client';

import { useState } from 'react';

const SCREENS = [
  { label: 'Intro', path: '/onboarding/intro', group: 'Onboarding' },
  { label: 'Pillars', path: '/onboarding/pillars', group: 'Onboarding' },
  { label: 'Assessment', path: '/onboarding/assessment', group: 'Onboarding' },
  { label: 'Morning', path: '/journal', group: 'Journal' },
  { label: 'Evening', path: '/journal', group: 'Journal' },
  { label: 'Scorecard', path: '/journal', group: 'Journal' },
  { label: 'Dashboard', path: '/dashboard', group: 'App' },
  { label: 'Insights', path: '/analytics', group: 'App' },
  { label: 'Settings', path: '/settings', group: 'App' },
];

export default function PreviewPage() {
  const [active, setActive] = useState(0);

  const iframeSrc = SCREENS[active].path;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-12 px-6"
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/40 mb-2">
          Inner Game Journal
        </p>
        <h1 className="text-3xl font-medium text-white">The game outside starts inside.</h1>
        <p className="text-white/40 text-sm mt-2">Mobile preview</p>
      </div>

      {/* Screen selector */}
      <div className="mb-10 space-y-3">
        {['Onboarding', 'Journal', 'App'].map((group) => (
          <div key={group} className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/25 w-20 text-right">
              {group}
            </span>
            <div className="flex gap-2 flex-wrap">
              {SCREENS.filter((s) => s.group === group).map((s, _, arr) => {
                const i = SCREENS.indexOf(s);
                return (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active === i
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Phone frame */}
      <div className="relative" style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.6))' }}>
        {/* Outer shell */}
        <div
          className="relative rounded-[52px] p-[3px]"
          style={{
            background: 'linear-gradient(145deg, #4a4a4a 0%, #1c1c1c 40%, #3a3a3a 100%)',
            width: 393,
          }}
        >
          {/* Inner bezel */}
          <div
            className="relative rounded-[50px] overflow-hidden"
            style={{ background: '#000', padding: '12px 2px 2px 2px' }}
          >
            {/* Dynamic Island */}
            <div className="flex justify-center mb-0 relative z-10" style={{ marginTop: -6 }}>
              <div
                className="rounded-full"
                style={{
                  width: 120,
                  height: 34,
                  background: '#000',
                  borderRadius: 20,
                }}
              />
            </div>

            {/* Screen */}
            <div
              className="relative overflow-hidden rounded-[44px]"
              style={{ width: 387, height: 836, marginTop: -28 }}
            >
              <iframe
                key={`${active}-${iframeSrc}`}
                src={iframeSrc}
                style={{
                  width: 390,
                  height: 844,
                  border: 'none',
                  transform: 'scale(0.992)',
                  transformOrigin: 'top left',
                  pointerEvents: 'auto',
                }}
                title="Inner Game Journal Preview"
              />
            </div>

            {/* Home indicator */}
            <div className="flex justify-center py-2">
              <div className="w-32 h-1 rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        {/* Side buttons — volume up */}
        <div
          className="absolute rounded-l-sm"
          style={{
            left: -4,
            top: 160,
            width: 4,
            height: 36,
            background: 'linear-gradient(to right, #2a2a2a, #3a3a3a)',
          }}
        />
        <div
          className="absolute rounded-l-sm"
          style={{
            left: -4,
            top: 210,
            width: 4,
            height: 36,
            background: 'linear-gradient(to right, #2a2a2a, #3a3a3a)',
          }}
        />
        {/* Power button */}
        <div
          className="absolute rounded-r-sm"
          style={{
            right: -4,
            top: 190,
            width: 4,
            height: 70,
            background: 'linear-gradient(to left, #2a2a2a, #3a3a3a)',
          }}
        />
      </div>

      {/* Caption */}
      <p className="text-white/30 text-xs mt-8">
        Live app · Click inside the phone to interact
      </p>
    </div>
  );
}
