'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCheckinStatus } from '@/lib/hooks/useCheckinStatus'
import { getWeekStart, isSunday } from '@/lib/utils/scoring'
import { getRecommendedChapter } from '@/lib/utils/pillars'
import { BottomNav } from '@/components/layout/BottomNav'

interface RecentEntry {
  date: string
  total: number | null
  morningDone: boolean
  eveningDone: boolean
}

interface DashState {
  streak: number
  longestStreak: number
  totalDays: number
  lowestDim: string
  gapText: string
  todayScore: number | null
  recentEntries: RecentEntry[]
  insightText: string
  milestoneShown: boolean
  milestoneSummary: string
  loadingMilestone: boolean
  loading: boolean
}

// The 3 phases per the spec: Morning "Set the Field" → Evening "Harvest" → Scorecard
const PHASES = [
  { key: 'morning', label: 'Set the Field',  icon: '☀️' },
  { key: 'evening', label: 'Harvest',         icon: '🌙' },
  { key: 'score',   label: 'Score the Day',   icon: '📊' },
]

export default function DashboardPage() {
  const status = useCheckinStatus()
  const sunday = isSunday()
  const recommended = getRecommendedChapter('')

  const [state, setState] = useState<DashState>({
    streak: 0, longestStreak: 0, totalDays: 0, lowestDim: '', gapText: '',
    todayScore: null, recentEntries: [], insightText: '',
    milestoneShown: false, milestoneSummary: '', loadingMilestone: false, loading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState(s => ({ ...s, loading: false })); return }

      const today = new Date().toISOString().split('T')[0]
      const weekStart = getWeekStart()

      const [
        { data: streakRow },
        { data: profile },
        { data: todayScorecard },
        { data: recentScorecards },
        { data: recentMornings },
        { data: recentEvenings },
        { data: insight },
      ] = await Promise.all([
        supabase.from('user_streaks').select('current_streak,longest_streak,total_days').eq('user_id', user.id).single(),
        supabase.from('user_profiles').select('identity_gap_text').eq('id', user.id).single(),
        supabase.from('daily_scorecards').select('awareness,intention,state,presence,ownership').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('daily_scorecards').select('date,awareness,intention,state,presence,ownership').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
        supabase.from('morning_checkins').select('date').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
        supabase.from('evening_checkins').select('date').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
        supabase.from('daily_insights').select('insight_text').eq('user_id', user.id).eq('date', today).maybeSingle(),
      ])

      // Compute today's total score
      let todayScore: number | null = null
      if (todayScorecard) {
        const s = todayScorecard as Record<string, number>
        const vals = [s.awareness, s.intention, s.state, s.presence, s.ownership].filter(Boolean)
        todayScore = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null
      }

      // Build recent entries (last 7 days)
      const morningDates = new Set((recentMornings ?? []).map((r: { date: string }) => r.date))
      const eveningDates = new Set((recentEvenings ?? []).map((r: { date: string }) => r.date))
      const scoreMap = new Map<string, number>()
      ;(recentScorecards ?? []).forEach((sc: Record<string, number | string>) => {
        const vals = [sc.awareness, sc.intention, sc.state, sc.presence, sc.ownership]
          .filter((v): v is number => typeof v === 'number')
        if (vals.length) scoreMap.set(sc.date as string, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10)
      })

      const recentEntries: RecentEntry[] = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        return {
          date: dateStr,
          total: scoreMap.get(dateStr) ?? null,
          morningDone: morningDates.has(dateStr),
          eveningDone: eveningDates.has(dateStr),
        }
      })

      // Lowest dimension for recommendation
      let lowestDim = ''
      if (recentScorecards?.length) {
        const dims: Record<string, number[]> = { awareness: [], intention: [], state: [], presence: [], ownership: [] }
        recentScorecards.forEach((sc: Record<string, number>) => {
          Object.keys(dims).forEach(k => { if (sc[k]) dims[k].push(sc[k]) })
        })
        const avgs = Object.entries(dims).map(([k, vs]) => [k, vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0] as [string, number])
        lowestDim = avgs.filter(([, v]) => v > 0).sort(([, a], [, b]) => a - b)[0]?.[0] ?? ''
      }

      const currentStreak = streakRow?.current_streak ?? 0
      const showMilestone = [7, 30].includes(currentStreak) && status.morningDone

      setState(s => ({
        ...s,
        streak: currentStreak,
        longestStreak: streakRow?.longest_streak ?? 0,
        totalDays: streakRow?.total_days ?? 0,
        lowestDim,
        gapText: profile?.identity_gap_text ?? '',
        todayScore,
        recentEntries,
        insightText: insight?.insight_text ?? '',
        milestoneShown: showMilestone,
        loading: false,
      }))

      if (showMilestone) {
        setState(s => ({ ...s, loadingMilestone: true }))
        const res = await fetch('/api/streak-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streakDays: currentStreak }),
        })
        const data = await res.json()
        setState(s => ({ ...s, milestoneSummary: data.summary ?? '', loadingMilestone: false }))
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.morningDone, status.eveningDone, status.scorecardDone])

  // ─── Hero CTA: sequential + time-gated evening ───
  function getHero() {
    // Step 1: Morning — always the entry point
    if (!status.morningDone) return {
      phase: 1,
      heading: 'Set the field for today.',
      sub: '5 minutes. Identity first — actions follow.',
      btn: 'Start morning →',
      href: '/checkin/morning',
      accent: 'var(--blue)',
      locked: false,
    }

    // Step 2: Evening — only after morning; time-gated to scheduled evening time
    if (!status.eveningDone) {
      const [evHr, evMin] = status.eveningTime.split(':').map(Number)
      const now = new Date()
      const eveningOpen = now.getHours() > evHr || (now.getHours() === evHr && now.getMinutes() >= evMin)

      if (!eveningOpen) {
        const fmt = new Date(); fmt.setHours(evHr, evMin, 0)
        const label = fmt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        return {
          phase: 2,
          heading: 'Morning complete.',
          sub: `Your evening check-in opens at ${label}. Come back then to reflect on how today went.`,
          btn: undefined,
          href: '',
          accent: 'var(--teal)',
          locked: true,
        }
      }

      return {
        phase: 2,
        heading: 'Time to harvest your day.',
        sub: 'What did today reveal about you?',
        btn: 'Start evening →',
        href: '/checkin/evening',
        accent: 'var(--purple)',
        locked: false,
      }
    }

    // Step 3: Scorecard
    if (!status.scorecardDone) return {
      phase: 3,
      heading: 'Score the day.',
      sub: 'Rate the 5 dimensions before you close it.',
      btn: 'Daily scorecard →',
      href: '/checkin/scorecard',
      accent: 'var(--teal)',
      locked: false,
    }

    // All done
    return {
      phase: 0,
      heading: 'Today is complete.',
      sub: state.todayScore
        ? `You scored ${state.todayScore}/5 today. ${state.streak} day streak.`
        : `${state.streak} day streak. Keep going.`,
      btn: state.insightText ? "Read today's insight →" : undefined,
      href: '/patterns',
      accent: 'var(--teal)',
      locked: false,
    }
  }

  const hero = getHero()

  // Phase progress dots
  const phaseStatus = [status.morningDone, status.eveningDone, status.scorecardDone]

  // Format date for display
  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === today.toISOString().split('T')[0]) return 'Today'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (status.loading || state.loading) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--teal)' }}>Inner Game Journal</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{state.streak} day{state.streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div style={{ padding: '20px 20px', flex: 1, overflowY: 'auto' }}>

        {/* ── Today's phase progress ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {PHASES.map((p, i) => (
            <div key={p.key} style={{
              flex: 1, padding: '12px 10px', borderRadius: 14, textAlign: 'center',
              background: phaseStatus[i] ? 'var(--teal-dim)' : hero.phase === i + 1 ? 'var(--bg2)' : 'var(--bg3)',
              border: `1px solid ${phaseStatus[i] ? 'var(--teal-border)' : hero.phase === i + 1 ? 'var(--border)' : 'transparent'}`,
              opacity: !phaseStatus[i] && hero.phase !== i + 1 && hero.phase !== 0 ? 0.45 : 1,
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{phaseStatus[i] ? '✓' : p.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: phaseStatus[i] ? 'var(--teal)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* ── Hero CTA ── */}
        <div className="card" style={{ marginBottom: 20, background: 'var(--bg2)', borderLeft: `3px solid ${hero.accent}` }}>
          {hero.phase > 0 && (
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-tertiary)', marginBottom: 8 }}>
              Phase {hero.phase} of 3
            </p>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{hero.heading}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: hero.btn ? 18 : 0, lineHeight: 1.55 }}>{hero.sub}</p>
          {hero.btn && (
            <Link href={hero.href} style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ background: hero.accent, color: hero.textColor }}>{hero.btn}</button>
            </Link>
          )}
        </div>

        {/* ── Sunday weekly reset banner ── */}
        {sunday && !status.weeklyResetDone && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--amber-dim)', border: '1px solid var(--amber-border)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>📅 Sunday — Weekly Reset</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Review the week. Find the pattern. Set the standard.</p>
            <Link href="/weekly/data-bridge">
              <button className="btn btn-ghost" style={{ padding: '11px 16px', fontSize: 13 }}>Start weekly reset →</button>
            </Link>
          </div>
        )}

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Current Streak', value: `${state.streak}d` },
            { label: 'Longest',        value: `${state.longestStreak}d` },
            { label: 'Total Days',     value: `${state.totalDays}` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg3)', borderRadius: 14, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{stat.value}</p>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent entries ── */}
        {state.recentEntries.some(e => e.morningDone || e.eveningDone) && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 12 }}>Recent entries</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.recentEntries.filter(e => e.morningDone || e.eveningDone).map(entry => (
                <div key={entry.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{fmtDate(entry.date)}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {[entry.morningDone && 'Morning', entry.eveningDone && 'Evening'].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {entry.total !== null ? (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: entry.total >= 4 ? 'var(--teal)' : entry.total >= 3 ? 'var(--blue)' : 'var(--text-secondary)' }}>{entry.total}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>/ 5</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No score</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Today's AI insight (if available) ── */}
        {state.insightText && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--bg2)', borderLeft: '3px solid var(--purple)' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--purple)', marginBottom: 10 }}>Today&apos;s pattern insight</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{state.insightText}</p>
          </div>
        )}

        {/* ── Recommended chapter (Day 3+) ── */}
        {state.totalDays >= 3 && state.lowestDim && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 10 }}>Recommended for you</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Ch.{getRecommendedChapter(state.lowestDim).chapter} — {getRecommendedChapter(state.lowestDim).title}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              {getRecommendedChapter(state.lowestDim).description}
            </p>
            <Link href="/learn">
              <button className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Read now →</button>
            </Link>
          </div>
        )}

        {/* ── Quick nav ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {[
            { label: '📊 Patterns', href: '/patterns', show: state.totalDays >= 7 },
            { label: '🧠 Assessment', href: '/assessment', show: state.totalDays >= 3 },
            { label: '📖 Learn', href: '/learn', show: true },
            { label: '🔁 Weekly Reset', href: '/weekly/data-bridge', show: true },
          ].filter(t => t.show).map(tile => (
            <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{tile.label}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* ── Milestone modal ── */}
      {state.milestoneShown && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 430, margin: '0 auto' }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal)', marginBottom: 12 }}>Day {state.streak} of showing up</p>
            {state.gapText && (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                On day one, you said: <em style={{ color: 'var(--text-secondary)' }}>&quot;{state.gapText}&quot;</em>
              </p>
            )}
            {state.loadingMilestone ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Synthesising your patterns…</p>
            ) : (
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 24 }}>{state.milestoneSummary}</p>
            )}
            <button className="btn btn-ghost" onClick={() => setState(s => ({ ...s, milestoneShown: false }))}>Close</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
