'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 4
const GOALS = [
  { value: 'inner_clarity', label: 'Inner Clarity', desc: 'I know what I want. I don\'t know why I keep getting in my own way.' },
  { value: 'identity_beliefs', label: 'Identity & Beliefs', desc: 'The story I tell about myself is the thing holding me back most.' },
  { value: 'emotional_resilience', label: 'Emotional Resilience', desc: 'My patterns under pressure are the problem. I react when I should respond.' },
] as const

function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 40 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? 'var(--purple)' : 'var(--bg3)', transition: 'all 0.3s' }} />
      ))}
    </div>
  )
}

export default function IdentityPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [gapText, setGapText] = useState('')
  const [goal, setGoal] = useState<string>('')
  const [saving, setSaving] = useState(false)

  async function saveAndContinue() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        identity_gap_text: gapText,
        focus_pillar: goal,
      })
    }
    setSaving(false)
    setStep(4)
  }

  const P = { padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' as const, flex: 1 }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <ProgressDots current={step === 4 ? 2 : step === 3 ? 2 : step} />
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={P} className="slide-in">
          <p className="section-label" style={{ color: 'var(--purple)', marginBottom: 20 }}>Step 1 of 4 · Your gap</p>
          <h2 className="question" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 12 }}>
            What&apos;s the gap between who you are and who you&apos;re capable of being?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.55 }}>No right answer. Write what&apos;s actually true right now.</p>
          <textarea
            className="focus-purple"
            value={gapText}
            onChange={e => setGapText(e.target.value)}
            placeholder="The gap I keep running into is…"
            rows={5}
            maxLength={400}
            style={{ flex: 1, marginBottom: 24 }}
          />
          <button
            className="btn btn-purple"
            disabled={gapText.trim().length < 20}
            onClick={() => setStep(2)}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={P} className="slide-in">
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, textAlign: 'left', marginBottom: 24 }}>← Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Which of these feels most urgent right now?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.55 }}>Pick one. Force the choice — that&apos;s the first act of clarity.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                style={{
                  background: goal === g.value ? 'var(--purple-dim)' : 'var(--bg3)',
                  border: `1px solid ${goal === g.value ? 'var(--purple)' : 'var(--border)'}`,
                  borderLeft: goal === g.value ? '3px solid var(--purple)' : undefined,
                  borderRadius: 14,
                  padding: '16px 18px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{g.label}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.desc}</p>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-purple" disabled={!goal} onClick={() => setStep(3)}>
              This is my focus →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div style={{ ...P, textAlign: 'center' }} className="slide-in">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--purple-dim)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <span style={{ fontSize: 28 }}>✓</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Your starting point is set.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>What you just named is the work. The journal will help you track the patterns underneath it.</p>
          <div className="card accent-purple" style={{ textAlign: 'left', marginBottom: 16 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--purple)', marginBottom: 10 }}>Your gap</p>
            <p className="question" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{gapText}</p>
          </div>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'var(--purple-dim)', border: '1px solid var(--purple-border)', marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>{GOALS.find(g => g.value === goal)?.label}</p>
          </div>
          <button className="btn btn-purple" onClick={saveAndContinue} disabled={saving}>
            {saving ? 'Saving…' : 'Start your first session →'}
          </button>
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, marginTop: 16 }}>
            Change my focus
          </button>
        </div>
      )}

      {/* Step 4 — Handoff */}
      {step === 4 && (
        <div style={{ ...P, textAlign: 'center' }} className="slide-in">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <span style={{ fontSize: 28 }}>▶</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>First session, starting now.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 40 }}>This is an abbreviated check-in — just 3 questions. No pressure.</p>
          <button className="btn btn-teal" onClick={() => router.push('/onboarding/first-checkin')}>
            Begin →
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>Takes about 3 minutes</p>
        </div>
      )}
    </div>
  )
}
