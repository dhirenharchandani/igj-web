'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/layout/BottomNav'

const AREAS = [
  { key: 'body_energy',    label: 'Body & Energy',          desc: 'Sleep, movement, and nutrition aren\'t afterthoughts — they\'re the foundation everything else is built on.' },
  { key: 'mind_dialogue',  label: 'Mind & Inner Dialogue',  desc: 'I\'m aware of the voice in my head. I don\'t believe every thought. I direct my mental state.' },
  { key: 'intimacy',       label: 'Intimacy & Presence',    desc: 'My closest relationship gets my real presence, not my leftovers.' },
  { key: 'family',         label: 'Family & Roots',         desc: 'I\'m building connection, not just coexisting. My family knows I\'m in their corner.' },
  { key: 'circle',         label: 'Circle & Influence',     desc: 'The people around me raise the standard. I invest in relationships that challenge and expand me.' },
  { key: 'purpose',        label: 'Purpose & Impact',       desc: 'My work is an expression of something real. I\'m not just executing tasks.' },
  { key: 'experiences',    label: 'Experiences & Aliveness', desc: 'I\'m creating a life worth living, not just managing one.' },
  { key: 'alignment',      label: 'Inner Alignment',        desc: 'My actions match my values. I\'m not performing a version of myself.' },
  { key: 'wealth',         label: 'Wealth & Responsibility', desc: 'I take full ownership of my financial reality. Building, not just earning.' },
  { key: 'growth',         label: 'Growth & Curiosity',     desc: 'I\'m always in the game of becoming. I seek feedback. I question assumptions.' },
]

function getColor(v: number): string {
  if (v <= 3) return 'var(--coral)'
  if (v <= 6) return 'var(--amber)'
  return 'var(--teal)'
}

export default function AssessmentPage() {
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const area = AREAS[current]
  const score = scores[area.key] ?? 0

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('life_assessments').insert({ user_id: user.id, ...scores })
    }
    setSaving(false)
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--purple)', marginBottom: 20 }}>Assessment complete</p>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 28 }}>Your baseline is set.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {AREAS.map(a => (
            <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>{a.label}</span>
              <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(scores[a.key] ?? 0) * 10}%`, background: getColor(scores[a.key] ?? 0), borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: getColor(scores[a.key] ?? 0), width: 24, textAlign: 'right' }}>{scores[a.key] ?? 0}</span>
            </div>
          ))}
        </div>
        <Link href="/dashboard">
          <button className="btn btn-teal">Back to dashboard →</button>
        </Link>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--purple)' }}>Whole life assessment</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{current + 1}/{AREAS.length}</p>
        </div>
        <div className="progress-track" style={{ marginBottom: 16 }}>
          <div className="progress-fill" style={{ width: `${((current + 1) / AREAS.length) * 100}%`, background: 'var(--purple)' }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 20px 120px' }}>
        <h2 className="question" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 12 }}>
          {area.label}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36 }}>{area.desc}</p>

        <p className="question" style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
          Not where you want to be. Where you actually are.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>Rate 1 (very low) to 10 (excellent)</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <button
              key={i}
              onClick={() => setScores(s => ({ ...s, [area.key]: i }))}
              style={{
                width: 'calc(20% - 5px)',
                height: 44,
                borderRadius: 10,
                background: i <= score ? getColor(score) : 'var(--bg3)',
                border: `1px solid ${i <= score ? getColor(score) : 'var(--border)'}`,
                color: i <= score ? (score <= 6 ? '#0e0e0c' : '#fff') : 'var(--text-tertiary)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {i}
            </button>
          ))}
        </div>

        {score > 0 && (
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${score * 10}%`, background: getColor(score), borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto', padding: '12px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
        {current > 0 && (
          <button className="btn btn-ghost" onClick={() => setCurrent(c => c - 1)} style={{ flex: '0 0 auto', width: 'auto', padding: '14px 20px' }}>←</button>
        )}
        {current < AREAS.length - 1 ? (
          <button className="btn btn-purple" disabled={!score} onClick={() => setCurrent(c => c + 1)}>Next →</button>
        ) : (
          <button className="btn btn-purple" disabled={!score || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save my assessment →'}
          </button>
        )}
      </div>
    </div>
  )
}
