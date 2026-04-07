'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/scoring'
import { BottomNav } from '@/components/layout/BottomNav'

interface BridgeData {
  daysCompleted: number
  avgScore: number
  lowestDim: string
  topPattern: string
}

export default function DataBridgePage() {
  const [data, setData] = useState<BridgeData>({ daysCompleted: 0, avgScore: 0, lowestDim: '', topPattern: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart = getWeekStart()
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      const [{ data: scorecards }, { data: insights }] = await Promise.all([
        supabase.from('daily_scorecards').select('*').eq('user_id', user.id).gte('date', weekStart).lte('date', weekEndStr),
        supabase.from('daily_insights').select('lowest_dimension').eq('user_id', user.id).gte('date', weekStart).lte('date', weekEndStr).eq('is_saved', true),
      ])

      const daysCompleted = scorecards?.length ?? 0
      let avgScore = 0
      let lowestDim = ''

      if (daysCompleted > 0) {
        const dims: Record<string, number[]> = { awareness: [], intention: [], state: [], presence: [], ownership: [] }
        let total = 0, count = 0
        scorecards!.forEach((s: Record<string, number>) => {
          Object.keys(dims).forEach(k => { if (s[k]) { dims[k].push(s[k]); total += s[k]; count++ } })
        })
        avgScore = count > 0 ? parseFloat((total / count).toFixed(1)) : 0

        const avgs = Object.entries(dims).map(([k, vs]) => [k, vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0] as [string, number])
        lowestDim = avgs.filter(([, v]) => v > 0).sort(([, a], [, b]) => a - b)[0]?.[0] ?? ''
      }

      // Most common saved pattern
      const patternCounts: Record<string, number> = {}
      insights?.forEach(i => { if (i.lowest_dimension) patternCounts[i.lowest_dimension] = (patternCounts[i.lowest_dimension] ?? 0) + 1 })
      const topPattern = Object.entries(patternCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? ''

      setData({ daysCompleted, avgScore, lowestDim, topPattern })
      setLoading(false)
    }
    load()
  }, [])

  function scoreColor(v: number) {
    if (v < 2.5) return 'var(--coral)'
    if (v < 3.5) return 'var(--amber)'
    return 'var(--teal)'
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: 6 }}>Weekly Reset</p>
        <h1 className="question" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.25 }}>Here&apos;s your week at a glance.</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading your week…</p>
        ) : (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Before the reset — see what the data shows.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div className="card">
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Days completed</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{data.daysCompleted}<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/7</span></p>
              </div>

              <div className="card">
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Avg score</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: scoreColor(data.avgScore) }}>{data.avgScore || '—'}<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/5</span></p>
              </div>
            </div>

            {data.lowestDim && (
              <div className="card accent-amber" style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 8 }}>Lowest this week</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', marginBottom: 4 }}>{data.lowestDim}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This showed up most as the gap.</p>
              </div>
            )}

            {data.topPattern && (
              <div className="card" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Most flagged pattern</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{data.topPattern}</p>
              </div>
            )}

            <Link href="/weekly/reset">
              <button className="btn btn-amber">Now let&apos;s go deeper →</button>
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
