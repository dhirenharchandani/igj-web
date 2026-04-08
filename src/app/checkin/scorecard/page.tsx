'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DAILY_DIMENSIONS } from '@/lib/utils/pillars'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

const LABELS: Record<string, { low: string; mid: string; high: string }> = {
  awareness: { low: 'Autopilot', mid: 'Some self-observation', high: 'Full pattern awareness' },
  intention: { low: 'Reacted all day', mid: 'Partial alignment', high: 'Lived my intention fully' },
  state:     { low: 'Scattered/low', mid: 'Functional', high: 'Peak state throughout' },
  presence:  { low: 'Distracted and absent', mid: 'Mostly present', high: 'Fully in each moment' },
  ownership: { low: 'Blamed and avoided', mid: 'Mixed accountability', high: 'Full ownership' },
}

function getDotClass(i: number, value: number): string {
  if (i > value) return ''
  if (value <= 2) return 'selected-coral'
  if (value === 3) return 'selected-amber'
  return 'selected-blue'
}

export default function ScorecardPage() {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>({ awareness: 0, intention: 0, state: 0, presence: 0, ownership: 0 })
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState('')
  const [lowestDim, setLowestDim] = useState('')
  const [saved, setSaved] = useState(false)

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const allRated = Object.values(scores).every(v => v > 0)

  async function submit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]

    if (user) {
      await supabase.from('daily_scorecards').upsert({
        user_id: user.id, date: today, ...scores,
      })

      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      })
      const data = await res.json()
      setInsight(data.insight ?? '')
      setLowestDim(data.lowestDimension ?? '')
    }
    // Mark done in localStorage immediately — dashboard reads this, no async delay
    const today2 = new Date().toISOString().split('T')[0]
    localStorage.setItem('igj_scorecard_done_date', today2)
    setLoading(false)
  }

  async function saveInsight() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    if (user) {
      await supabase.from('daily_insights').update({ is_saved: true }).eq('user_id', user.id).eq('date', today)
    }
    setSaved(true)
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div className="tab-bar">
        <Link href="/checkin/morning" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Morning</button>
        </Link>
        <Link href="/checkin/evening" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Evening</button>
        </Link>
        <button className="active">Scorecard</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
        {!insight ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Daily scorecard</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>Rate each dimension honestly. This feeds your pattern data.</p>

            {DAILY_DIMENSIONS.map(dim => (
              <div key={dim.key} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</p>
                  {scores[dim.key] > 0 && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{scores[dim.key]}/5</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>{dim.description}</p>
                <div style={{ marginBottom: 6 }}>
                  <div className="dot-rating">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        className={getDotClass(i, scores[dim.key])}
                        onClick={() => setScores(s => ({ ...s, [dim.key]: i }))}
                        style={{ flex: 1, height: 44, borderRadius: 10 }}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                {scores[dim.key] > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {scores[dim.key] <= 2 ? LABELS[dim.key]?.low : scores[dim.key] === 3 ? LABELS[dim.key]?.mid : LABELS[dim.key]?.high}
                  </p>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 24 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{total} / 25</span>
            </div>

            <button className="btn btn-blue" disabled={!allRated || loading} onClick={submit}>
              {loading ? 'Reading your day…' : 'See today\'s pattern →'}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <p className="section-label" style={{ color: 'var(--blue)', marginBottom: 16 }}>Your pattern today</p>
              <div className="card accent-blue" style={{ background: 'var(--bg3)' }}>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{insight}</p>
              </div>
            </div>

            {lowestDim && (
              <div style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--blue-dim)', borderRadius: 10, border: '1px solid var(--blue-border)' }}>
                <p style={{ fontSize: 12, color: 'var(--blue)' }}>Focus area: <strong style={{ textTransform: 'capitalize' }}>{lowestDim}</strong></p>
              </div>
            )}

            <button
              className="btn btn-ghost"
              onClick={saveInsight}
              disabled={saved}
              style={{ marginBottom: 12 }}
            >
              {saved ? '✓ Insight saved' : 'Save this insight'}
            </button>

            <Link href="/dashboard">
              <button className="btn btn-teal">Done for today →</button>
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
