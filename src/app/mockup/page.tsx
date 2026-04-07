'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── Screen manifest ─────────────────────────────────────────────────────── */
const SCREENS = [
  { group: 'Onboarding', label: 'Landing / Auth',       url: '/' },
  { group: 'Onboarding', label: 'Identity + Goal',      url: '/onboarding/identity' },
  { group: 'Onboarding', label: 'First Check-in',       url: '/onboarding/first-checkin' },
  { group: 'Onboarding', label: 'Schedule',             url: '/onboarding/schedule' },
  { group: 'Dashboard',  label: 'Dashboard',            url: '/dashboard' },
  { group: 'Daily',      label: 'Morning Check-in',     url: '/checkin/morning' },
  { group: 'Daily',      label: 'Evening Check-in',     url: '/checkin/evening' },
  { group: 'Daily',      label: 'Daily Scorecard',      url: '/checkin/scorecard' },
  { group: 'Weekly',     label: 'Data Bridge',          url: '/weekly/data-bridge' },
  { group: 'Weekly',     label: 'Weekly Reset',         url: '/weekly/reset' },
  { group: 'Weekly',     label: 'Weekly Scorecard',     url: '/weekly/scorecard' },
  { group: 'Library',    label: 'Life Assessment',      url: '/assessment' },
  { group: 'Library',    label: 'Learn',                url: '/learn' },
  { group: 'Library',    label: 'Patterns',             url: '/patterns' },
]

const GROUPS = ['Onboarding', 'Dashboard', 'Daily', 'Weekly', 'Library'] as const

const GROUP_COLOR: Record<string, string> = {
  Onboarding: '#7f77dd',
  Dashboard:  '#1D9E75',
  Daily:      '#378ADD',
  Weekly:     '#EF9F27',
  Library:    '#9a9890',
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function readStoredTheme(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem('inner-game-journal')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.profile?.theme) return parsed.profile.theme
    }
  } catch {}
  return 'dark'
}

function writeStoredTheme(theme: 'dark' | 'light') {
  try {
    const raw = localStorage.getItem('inner-game-journal')
    const parsed = raw ? JSON.parse(raw) : {}
    parsed.profile = { ...(parsed.profile ?? {}), theme }
    localStorage.setItem('inner-game-journal', JSON.stringify(parsed))
  } catch {}
}

function applyThemeToIframe(iframe: HTMLIFrameElement | null, dark: boolean) {
  try {
    const doc = iframe?.contentDocument
    if (!doc) return
    if (dark) doc.documentElement.classList.add('dark')
    else doc.documentElement.classList.remove('dark')
  } catch {}
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function MockupPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [active, setActive] = useState(0)
  const [isDark, setIsDark] = useState(true)

  /* sync initial theme from localStorage */
  useEffect(() => {
    setIsDark(readStoredTheme() === 'dark')
  }, [])

  /* keep sidebar in sync as user taps links inside the phone */
  const syncSidebarFromIframe = useCallback(() => {
    try {
      const path = iframeRef.current?.contentWindow?.location.pathname ?? ''
      const idx = SCREENS.findIndex(
        s => s.url === path || (s.url !== '/' && path.startsWith(s.url + '/'))
      )
      if (idx >= 0) setActive(idx)
    } catch {}
  }, [])

  /* apply theme on every iframe load + sync sidebar */
  const handleIframeLoad = useCallback(() => {
    syncSidebarFromIframe()
    applyThemeToIframe(iframeRef.current, isDark)
  }, [isDark, syncSidebarFromIframe])

  /* navigate iframe to a screen */
  function goTo(index: number) {
    setActive(index)
    try {
      const cw = iframeRef.current?.contentWindow
      if (cw) cw.location.href = SCREENS[index].url
    } catch {}
  }

  /* theme toggle */
  function toggleTheme() {
    const newDark = !isDark
    setIsDark(newDark)
    writeStoredTheme(newDark ? 'dark' : 'light')
    applyThemeToIframe(iframeRef.current, newDark)
  }

  /* ── button styles ── */
  const arrowBtn = (disabled: boolean): React.CSSProperties => ({
    position: 'absolute',
    background: disabled ? '#111' : '#1e1e1e',
    border: '1px solid #2a2a2a',
    color: disabled ? '#2a2a2a' : '#888',
    width: 36, height: 36, borderRadius: '50%',
    fontSize: 20, cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  })

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#080808',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflow: 'hidden',
    }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div style={{
        width: 216,
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#0c0c0c',
      }}>

        {/* header */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1a1a1a' }}>
          <p style={{ color: '#3a3a3a', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 3px' }}>
            Inner Game Journal
          </p>
          <p style={{ color: '#e0ddd6', fontSize: 13, fontWeight: 600, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            All Screens
          </p>

          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8, width: '100%',
              background: isDark ? '#181818' : '#f0ede6',
              border: `1px solid ${isDark ? '#252525' : '#d0cdc8'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: isDark ? '#888' : '#4a4a4a',
              letterSpacing: '0.04em',
            }}>
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </span>
          </button>
        </div>

        {/* screen list grouped */}
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 16 }}>
          {GROUPS.map(group => {
            const items = SCREENS.map((s, i) => ({ ...s, i })).filter(s => s.group === group)
            const color = GROUP_COLOR[group]
            return (
              <div key={group}>
                <p style={{
                  padding: '14px 16px 5px',
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color,
                  margin: 0,
                }}>
                  {group}
                </p>
                {items.map(({ label, i }) => {
                  const isActive = active === i
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', textAlign: 'left',
                        padding: '8px 16px 8px 20px',
                        background: isActive ? '#181818' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                        color: isActive ? '#e0ddd6' : '#484848',
                        fontSize: 12, cursor: 'pointer',
                        transition: 'all 0.12s',
                        lineHeight: 1.3,
                      }}
                    >
                      {isActive && (
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: color, flexShrink: 0,
                          display: 'inline-block',
                        }} />
                      )}
                      {label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* footer counter */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #1a1a1a' }}>
          <p style={{ color: '#333', fontSize: 10, margin: 0 }}>
            {active + 1} of {SCREENS.length} screens
          </p>
        </div>
      </div>

      {/* ── Phone area ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080808',
        position: 'relative',
      }}>

        {/* prev arrow */}
        <button
          onClick={() => goTo(Math.max(0, active - 1))}
          disabled={active === 0}
          style={{ ...arrowBtn(active === 0), left: 36 }}
        >‹</button>

        {/* next arrow */}
        <button
          onClick={() => goTo(Math.min(SCREENS.length - 1, active + 1))}
          disabled={active === SCREENS.length - 1}
          style={{ ...arrowBtn(active === SCREENS.length - 1), right: 36 }}
        >›</button>

        {/* ── iPhone frame ── */}
        <div style={{
          position: 'relative',
          width: 340,
          height: 700,
          background: 'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderRadius: 54,
          padding: 12,
          boxShadow: [
            '0 0 0 1px #3a3a3a',
            '0 0 0 2px #0f0f0f',
            '0 0 0 3px #2a2a2a',
            '0 50px 140px rgba(0,0,0,0.9)',
            'inset 0 1px 0 rgba(255,255,255,0.06)',
          ].join(', '),
        }}>
          {/* physical buttons */}
          <div style={{ position: 'absolute', left: -3,  top: 118, width: 3, height: 34, background: '#222', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: -3,  top: 165, width: 3, height: 62, background: '#222', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: -3,  top: 241, width: 3, height: 62, background: '#222', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', right: -3, top: 190, width: 3, height: 86, background: '#222', borderRadius: '0 2px 2px 0' }} />

          {/* screen bezel */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 44,
            overflow: 'hidden',
            background: '#000',
            position: 'relative',
          }}>
            {/* dynamic island */}
            <div style={{
              position: 'absolute',
              top: 11,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 98,
              height: 29,
              background: '#000',
              borderRadius: 15,
              zIndex: 20,
              pointerEvents: 'none',
              boxShadow: '0 0 0 1px #1a1a1a',
            }} />

            {/* live iframe — persistent, fully interactive */}
            <iframe
              ref={iframeRef}
              src={SCREENS[0].url}
              onLoad={handleIframeLoad}
              style={{
                width: 390,
                height: 844,
                border: 'none',
                transform: 'scale(0.8)',
                transformOrigin: 'top left',
                display: 'block',
              }}
              title="App preview"
            />
          </div>
        </div>

        {/* screen label below phone */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <p style={{ color: '#d0cdc8', fontSize: 12, fontWeight: 500, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
            {SCREENS[active].label}
          </p>
          <p style={{ color: '#2e2e2e', fontSize: 10, margin: 0, letterSpacing: '0.06em' }}>
            {SCREENS[active].group.toUpperCase()} · {active + 1} / {SCREENS.length}
          </p>
        </div>
      </div>
    </div>
  )
}
