'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WEEKLY_DIMENSIONS } from '@/lib/utils/pillars'
import { getWeekStart } from '@/lib/utils/scoring'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

const LABELS: Record<string, { low: string; mid: string; high: string }> = {
  clarity:   { low: 'No clear direction', mid: 'Some clarity', high: 'Crystal clear all week' },
  ownership: { low: 'Full blame/avoidance', mid: 'Mixed', high: '100% ownership all week' },
  presence:  { low: 'Absent most of week', mid: 'Fluctuating', high: 'Fully present when it mattered' },
  standards: { low: 'Lowered repeatedly', mid: 'Held some', high: 'Non-negotiable all week' },
  courage:   { low: 'Avoided hard things', mid: 'Took some risks', high: 'Ran toward difficulty all week' },
  growth:    { low: 'Same week repeated', mid: 'Some learning', high: 'Genuinely shifted something' },
}

function getDotClass(i: number, value: number): string {
  if (i > value) return ''
  if (value <= 2) return 'selected-coral'
  if (value === 3) return 'selected-amber'
  return 'selected-teal'
}

export default function WeeklyScorecardPage() {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>({ clarity: 0, ownership: 0, presence: 0, standards: 0, courage: 0, growth: 0 })
  const [loading, setLoading] = useState(false)
  const [reflection, setReflection] = useState('')
  const [suggestedShift, setSuggestedShift] = useState('')
  const [focus, setFocus] = useState('')
  const [saving, setSaving] = useState(false)
  const [focusSaved, setFocusSaved] = useState(false)

  const allRated = Object.values(scores).every(v => v > 0)
  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  async function submit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const weekStart = getWeekStart()

    if (user) {
      await supabase.from('weekly_scorecards').upsert({ user_id: user.id, week_start: weekStart, ...scores })
      const res = await fetch('/api/weekly-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      })
      const data = await res.json()
      setReflection(data.reflection ?? '')
      setSuggestedShift(data.suggestedShift ?? '')
      setFocus(data.suggestedShift ?? '')
    }
    setLoading(false)
  }

  async function saveFocus() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('weekly_reflections').update({ next_week_focus: focus }).eq('user_id', user.id).eq('week_start', getWeekStart())
    }
    setSaving(false)
    setFocusSaved(true)
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: 4 }}>Weekly Reset</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Weekly scorecard</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {!reflection ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>Six dimensions. Did you live this, or just say it?</p>

            {WEEKLY_DIMENSIONS.map(dim => (
              <div key={dim.key} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</p>
                  {scores[dim.key] > 0 && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{scores[dim.key]}/5</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>{dim.description}</p>
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
                {scores[dim.key] > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                    {scores[dim.key] <= 2 ? LABELS[dim.key]?.low : scores[dim.key] === 3 ? LABELS[dim.key]?.mid : LABELS[dim.key]?.high}
                  </p>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 24 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{total} / 30</span>
            </div>

            <button className="btn btn-amber" disabled={!allRated || loading} onClick={submit}>
              {loading ? 'Synthesising your week…' : 'See your weekly reflection →'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16 }}>Your week, reflected back.</p>
            <div className="card accent-amber" style={{ marginBottom: 24, background: 'var(--bg3)' }}>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{reflection}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10 }}>Next week&apos;s focus:</p>
              <textarea
                className="focus-amber"
                value={focus}
                onChange={e => setFocus(e.target.value)}
                placeholder="What you'll shift next week…"
                rows={3}
                style={{ marginBottom: 10 }}
              />
              <button className="btn btn-ghost" onClick={saveFocus} disabled={saving || focusSaved}>
                {focusSaved ? '✓ Saved' : saving ? 'Saving…' : 'Save focus'}
              </button>
            </div>

            <Link href="/dashboard">
              <button className="btn btn-amber">Close the week →</button>
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
