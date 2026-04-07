'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DAILY_DIMENSIONS, WEEKLY_DIMENSIONS } from '@/lib/utils/pillars'
import { getScoreColor } from '@/lib/utils/scoring'
import { BottomNav } from '@/components/layout/BottomNav'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'

interface DailyScore { date: string; awareness: number; intention: number; state: number; presence: number; ownership: number }
interface WeeklyScore { week_start: string; clarity: number; ownership: number; presence: number; standards: number; courage: number; growth: number }
interface Insight { id: string; date: string; insight_text: string; created_at: string }

export default function PatternsPage() {
  const [dayCount, setDayCount] = useState(0)
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([])
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [activeDaily, setActiveDaily] = useState('awareness')
  const [activeWeekly, setActiveWeekly] = useState('clarity')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      const eightWeeksAgo = new Date(Date.now() - 56 * 86400000).toISOString().split('T')[0]

      const [{ count }, { data: daily }, { data: weekly }, { data: insightRows }] = await Promise.all([
        supabase.from('morning_checkins').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('daily_scorecards').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo).order('date'),
        supabase.from('weekly_scorecards').select('*').eq('user_id', user.id).gte('week_start', eightWeeksAgo).order('week_start'),
        supabase.from('daily_insights').select('id,date,insight_text,created_at').eq('user_id', user.id).eq('is_saved', true).order('date', { ascending: false }),
      ])

      setDayCount(count ?? 0)
      setDailyScores(daily ?? [])
      setWeeklyScores(weekly ?? [])
      setInsights(insightRows ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading patterns…</p>
    </div>
  )

  if (dayCount < 7) return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ fontSize: 40, marginBottom: 20 }}>≋</p>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Come back after 7 days</h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>You&apos;re on day {dayCount}. Patterns need time to form. Keep going — the data gets meaningful after a week.</p>
      <BottomNav />
    </div>
  )

  const dailyChartData = dailyScores.map(d => ({
    date: d.date.slice(5),
    value: d[activeDaily as keyof DailyScore] as number,
  }))

  const weeklyChartData = weeklyScores.map(d => ({
    date: d.week_start.slice(5),
    value: d[activeWeekly as keyof WeeklyScore] as number,
  }))

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal)', marginBottom: 4 }}>Your patterns</p>
        <h1 className="question" style={{ fontSize: 22, color: 'var(--text-primary)' }}>30 days of data. What it&apos;s actually showing you.</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 80px' }}>
        {/* Daily charts */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Daily scorecard trends</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {DAILY_DIMENSIONS.map(d => (
              <button
                key={d.key}
                className="chip"
                onClick={() => setActiveDaily(d.key)}
                style={{ border: activeDaily === d.key ? '1px solid var(--blue)' : undefined, color: activeDaily === d.key ? 'var(--blue)' : undefined }}
              >
                {d.label}
              </button>
            ))}
          </div>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {dailyChartData.map((entry, i) => (
                    <Cell key={i} fill={getScoreColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No data for the last 30 days yet.</p>
          )}
        </div>

        {/* Weekly charts */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Weekly scorecard trends</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {WEEKLY_DIMENSIONS.map(d => (
              <button
                key={d.key}
                className="chip"
                onClick={() => setActiveWeekly(d.key)}
                style={{ border: activeWeekly === d.key ? '1px solid var(--amber)' : undefined, color: activeWeekly === d.key ? 'var(--amber)' : undefined }}
              >
                {d.label}
              </button>
            ))}
          </div>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {weeklyChartData.map((entry, i) => (
                    <Cell key={i} fill={getScoreColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Complete your first weekly reset to see trends.</p>
          )}
        </div>

        {/* Saved insights */}
        {insights.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Saved insights</p>
            {insights.map(ins => (
              <div
                key={ins.id}
                className="card"
                style={{ marginBottom: 10, cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === ins.id ? null : ins.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded === ins.id ? 12 : 0 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ins.date}</p>
                  <span style={{ padding: '2px 8px', borderRadius: 10, background: 'var(--blue-dim)', fontSize: 10, color: 'var(--blue)' }}>Daily</span>
                </div>
                {expanded === ins.id && (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{ins.insight_text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
