'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateStreak } from '@/lib/utils/streak'

const CHIPS: Record<number, string[]> = {
  1: ['Patient and deliberate', 'Fully present', 'Decisive', 'Disciplined'],
  2: ['Finishing what I started', 'The conversation I\'ve been avoiding', 'Deep work, no distractions'],
  3: ['I showed up as who I said I\'d be', 'I completed the one thing', 'I closed the gap, even slightly'],
}

const QUESTIONS = [
  { q: 'Who do I need to be today?', sub: 'Not what you need to do. Who you need to be. Identity first, actions follow.', placeholder: 'Today I need to be someone who…' },
  { q: 'What\'s the one thing that matters most today?', sub: 'One thing. Not a list. If everything is important, nothing is.', placeholder: 'The one thing is…' },
  { q: 'What would make today a win?', sub: 'Be specific. Vague intentions produce vague outcomes.', placeholder: 'Today is a win if…' },
]

export default function FirstCheckinPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0=Q1, 1=Q2, 2=Q3, 3=done
  const [answers, setAnswers] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)

  function setAnswer(v: string) {
    const next = [...answers]; next[step] = v; setAnswers(next)
  }

  async function complete() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    if (user) {
      await supabase.from('morning_checkins').upsert({
        user_id: user.id,
        date: today,
        q1_intention: answers[0],
        q2_focus: answers[1],
        q6_win: answers[2],
        is_abbreviated: true,
      })
      // onboarding_step not in schema — onboarding_done is set at final step (schedule page)
      await updateStreak(user.id, supabase)
    }
    setSaving(false)
    setStep(3)
  }

  if (step === 3) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', padding: '48px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 28 }}>
          <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
            <circle cx="32" cy="32" r="30" stroke="var(--teal)" strokeWidth="2" />
            <path d="M18 32l10 10 18-18" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="0" style={{ animation: 'drawCheck 0.5s ease forwards' }} />
          </svg>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>First session done.</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36 }}>That&apos;s all it takes. A few minutes of honest intention. You&apos;ve started the practice.</p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Who you\'re being today', text: answers[0] },
            { label: 'The one thing', text: answers[1] },
            { label: 'What makes it a win', text: answers[2] },
          ].map((card, i) => (
            <div key={i} className="card accent-blue" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue)', marginBottom: 8 }}>{card.label}</p>
              <p className="question" style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{card.text}</p>
            </div>
          ))}
        </div>
        <button className="btn btn-teal" onClick={() => router.push('/onboarding/schedule')}>
          Set my check-in times →
        </button>
      </div>
    )
  }

  const q = QUESTIONS[step]

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: i === 3 ? 20 : 8, height: 8, borderRadius: 4, background: i === 3 ? 'var(--blue)' : 'var(--bg3)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 24px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Session badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>Your first session</span>
        </div>

        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 20 }}>
          Question {step + 1} of 3
        </p>
        <h2 className="question" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 10 }}>
          {q.q}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.55 }}>{q.sub}</p>

        <textarea
          className="focus-blue"
          value={answers[step]}
          onChange={e => setAnswer(e.target.value)}
          placeholder={q.placeholder}
          rows={4}
          style={{ marginBottom: 16 }}
        />

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {CHIPS[step + 1].map(chip => (
            <button key={chip} className="chip" onClick={() => setAnswer(chip)}>{chip}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1 as typeof step)} style={{ flex: '0 0 auto', width: 'auto', padding: '16px 20px' }}>← Back</button>
          )}
          {step < 2 ? (
            <button className="btn btn-blue" disabled={answers[step].trim().length < 10} onClick={() => setStep(s => s + 1 as typeof step)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-teal" disabled={answers[step].trim().length < 10 || saving} onClick={complete}>
              {saving ? 'Saving…' : 'Complete session →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
