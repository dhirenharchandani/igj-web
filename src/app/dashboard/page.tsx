'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCheckinStatus } from '@/lib/hooks/useCheckinStatus'
import { getWeekStart, isSunday } from '@/lib/utils/scoring'
import { getRecommendedChapter } from '@/lib/utils/pillars'
import { BottomNav } from '@/components/layout/BottomNav'

interface DashState {
  streak: number
  dayCount: number
  lowestDim: string
  gapText: string
  insightDate: string
  insightText: string
  milestoneShown: boolean
  milestoneSummary: string
  loadingMilestone: boolean
}

export default function DashboardPage() {
  const status = useCheckinStatus()
  const [state, setState] = useState<DashState>({
    streak: 0, dayCount: 0, lowestDim: '', gapText: '', insightDate: '',
    insightText: '', milestoneShown: false, milestoneSummary: '', loadingMilestone: false,
  })

  const hour = new Date().getHours()
  const sunday = isSunday()
  const recommended = getRecommendedChapter(state.lowestDim)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date().toISOString().split('T')[0]

      const [{ data: streakRow }, { data: profile }, { data: insight }, { data: scorecards }] = await Promise.all([
        supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
        supabase.from('user_profiles').select('identity_gap_text').eq('id', user.id).single(),
        supabase.from('daily_insights').select('insight_text, date').eq('user_id', user.id).eq('date', today).single(),
        supabase.from('daily_scorecards').select('awareness,intention,state,presence,ownership').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
      ])

      // Count entries for dayCount
      const { count } = await supabase.from('morning_checkins').select('id', { count: 'exact' }).eq('user_id', user.id)

      // Find lowest dimension
      let lowestDim = ''
      if (scorecards?.length) {
        const dims: Record<string, number[]> = { awareness: [], intention: [], state: [], presence: [], ownership: [] }
        scorecards.forEach((s: Record<string, number>) => {
          Object.keys(dims).forEach(k => { if (s[k]) dims[k].push(s[k]) })
        })
        const avgs = Object.entries(dims).map(([k, vs]) => [k, vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0] as [string, number])
        lowestDim = avgs.filter(([, v]) => v > 0).sort(([, a], [, b]) => a - b)[0]?.[0] ?? ''
      }

      const currentStreak = streakRow?.current_streak ?? 0
      const showMilestone = [7, 30].includes(currentStreak)

      setState(s => ({
        ...s,
        streak: currentStreak,
        dayCount: count ?? 0,
        lowestDim,
        gapText: profile?.identity_gap_text ?? '',
        insightDate: insight?.date ?? '',
        insightText: insight?.insight_text ?? '',
        milestoneShown: showMilestone,
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
  }, [])

  // Hero CTA logic
  function getHero() {
    if (sunday && !status.weeklyResetDone) return {
      heading: 'Time for your weekly reset.',
      sub: 'This is where the real work happens.',
      btn: 'Start weekly reset →',
      href: '/weekly/data-bridge',
      color: 'var(--amber)',
      textColor: '#0e0e0c',
    }
    if (hour >= 5 && hour < 12 && !status.morningDone) return {
      heading: 'Your morning check-in is ready.',
      sub: '5 minutes. Set the frame for today.',
      btn: 'Start morning →',
      href: '/checkin/morning',
      color: 'var(--blue)',
      textColor: '#fff',
    }
    if (hour >= 12 && hour < 21 && !status.eveningDone) return {
      heading: 'Take 5 minutes to reflect.',
      sub: 'How did today actually go?',
      btn: 'Start evening →',
      href: '/checkin/evening',
      color: 'var(--blue)',
      textColor: '#fff',
    }
    if (status.morningDone && status.eveningDone && !status.scorecardDone) return {
      heading: 'One last thing.',
      sub: 'Score your day before you close it.',
      btn: 'Daily scorecard →',
      href: '/checkin/scorecard',
      color: 'var(--blue)',
      textColor: '#fff',
    }
    return {
      heading: 'You\'re done for today.',
      sub: `${state.streak} day streak. Keep going.`,
      btn: state.insightText ? 'View today\'s insight →' : undefined,
      href: '/checkin/scorecard',
      color: 'var(--teal)',
      textColor: '#fff',
    }
  }

  const hero = getHero()

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--teal)' }}>IGJ</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{state.streak} day{state.streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        {/* Hero CTA */}
        <div className="card" style={{ marginBottom: 20, background: 'var(--bg2)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{hero.heading}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: hero.btn ? 20 : 0, lineHeight: 1.5 }}>{hero.sub}</p>
          {hero.btn && (
            <Link href={hero.href} style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ background: hero.color, color: hero.textColor }}>{hero.btn}</button>
            </Link>
          )}
        </div>

        {/* Day 3 assessment banner */}
        {state.dayCount >= 3 && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--purple-dim)', border: '1px solid var(--purple-border)' }}>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.55 }}>
              Before your next session, take 5 minutes to map your whole life.
            </p>
            <Link href="/assessment">
              <button className="btn btn-purple" style={{ padding: '12px 16px', fontSize: 13 }}>
                Take the assessment →
              </button>
            </Link>
          </div>
        )}

        {/* Recommended chapter (Day 3+) */}
        {state.dayCount >= 3 && state.lowestDim && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 10 }}>Recommended for you</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Ch.{recommended.chapter} — {recommended.title}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{recommended.description}</p>
            <Link href="/learn">
              <button className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Read now →</button>
            </Link>
          </div>
        )}

        {/* Nav tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Daily check-in', href: '/checkin/morning', color: 'var(--blue-dim)', border: 'var(--blue-border)', text: 'var(--blue)' },
            { label: 'Weekly reset', href: '/weekly/data-bridge', color: 'var(--amber-dim)', border: 'var(--amber-border)', text: 'var(--amber)' },
            { label: 'Learn More', href: '/learn', color: 'var(--gray-dim)', border: 'var(--gray-border)', text: 'var(--gray)' },
          ].map(tile => (
            <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: tile.color, border: `1px solid ${tile.border}`, borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: tile.text, lineHeight: 1.4 }}>{tile.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {state.dayCount >= 7 && (
          <Link href="/patterns" style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 8 }}>View your patterns →</p>
          </Link>
        )}
      </div>

      {/* Milestone modal */}
      {state.milestoneShown && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 430, margin: '0 auto' }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal)', marginBottom: 12 }}>Day {state.streak} of showing up</p>
            {state.gapText && (
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>On day one, you said: <em style={{ color: 'var(--text-secondary)' }}>&quot;{state.gapText}&quot;</em></p>
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
