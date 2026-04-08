'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateStreak } from '@/lib/utils/streak'
import { BottomNav } from '@/components/layout/BottomNav'

const CHIPS: Record<string, string[]> = {
  gratitude: [
    'The relationships I\'ve built',
    'My health and ability to show up',
    'The progress I\'ve made, even if slow',
    'My ability to learn and adapt',
  ],
  q1: ['Patient and deliberate', 'Fully present', 'Decisive', 'Disciplined', 'Calm under pressure'],
  q2: ['Finishing what I started', 'The conversation I\'ve been avoiding', 'Deep work, no distractions', 'The decision I\'ve been putting off'],
  q3: ['High — clear and focused', 'Low — didn\'t rest enough', 'Scattered — too many open loops', 'Anxious — avoiding something', 'Flat — disconnected from purpose'],
  q4: ['Avoidance', 'Overthinking', 'Reactivity', 'Control', 'People-pleasing', 'Distraction'],
  q5: ['I respond instead of react', 'I finish what I start', 'I do what I said I would', 'I don\'t complain, I solve', 'I show up fully, not partially'],
  q6: ['I completed the one thing', 'I showed up as who I said I\'d be', 'I closed the gap, even slightly', 'I moved the needle on what matters most'],
}

interface Form { gratitude: string; q1: string; q2: string; q3: string; q4: string; q5: string; q6: string }

function QuestionBlock({ label, sub, field, placeholder, chips, value, onChange }: {
  label: string; sub: string; field: string; placeholder: string
  chips?: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 className="question" style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>{label}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{sub}</p>
      <textarea className="focus-blue" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      {chips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {chips.map(c => <button key={c} className="chip" onClick={() => onChange(c)}>{c}</button>)}
        </div>
      )}
    </div>
  )
}

export default function MorningPage() {
  const router = useRouter()
  const [form, setForm] = useState<Form>({ gratitude: '', q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(k: keyof Form, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    if (user) {
      await supabase.from('morning_checkins').upsert({
        user_id: user.id, date: today,
        gratitude_entry: form.gratitude,
        q1_intention: form.q1,
        q2_focus: form.q2,
        q3_energy: form.q3,
        q4_pattern: form.q4,
        q5_standard: form.q5,
        q6_win: form.q6,
        is_abbreviated: false,
      })
      await updateStreak(user.id, supabase)
    }
    // ── Mark done in localStorage immediately — dashboard reads this, no async delay ──
    localStorage.setItem('igj_morning_done_date', today)
    setSaving(false)
    setSaved(true)
  }

  // ── Completion screen ──
  if (saved) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, fontSize: 28 }}>
          ✓
        </div>

        <h2 className="question" style={{ fontSize: 28, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 14, lineHeight: 1.25 }}>
          Morning locked in.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.65, marginBottom: 28 }}>
          You've set the field for today. Come back this evening to reflect on how it actually went.
        </p>

        {form.q1 && (
          <div style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--blue)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue)', marginBottom: 10 }}>Your intention today</p>
            <p className="question" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
              &ldquo;{form.q1}&rdquo;
            </p>
          </div>
        )}

        <div style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>🌙 Evening check-in available after 5 PM</p>
        </div>

        <button className="btn btn-teal" onClick={() => { router.refresh(); router.push('/dashboard') }}>
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div className="tab-bar">
        <button className="active">Morning</button>
        <Link href="/checkin/evening" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Evening</button>
        </Link>
        <Link href="/checkin/scorecard" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Scorecard</button>
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
        {/* Gratitude primer */}
        <div style={{ marginBottom: 32 }}>
          <p className="section-label" style={{ color: 'var(--text-tertiary)', marginBottom: 12 }}>State primer</p>
          <h3 className="question" style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>What&apos;s already working in your life that you&apos;re not giving enough credit to?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>This isn&apos;t positivity. It&apos;s pattern calibration. You can&apos;t see clearly from a deficit lens.</p>
          <textarea className="focus-blue" value={form.gratitude} onChange={e => set('gratitude', e.target.value)} placeholder="What's already working is…" rows={3} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {CHIPS.gratitude.map(c => <button key={c} className="chip" onClick={() => set('gratitude', c)}>{c}</button>)}
          </div>
        </div>

        <QuestionBlock label="Who do I need to be today?" sub="Identity first. Actions follow." field="q1" placeholder="Today I need to be someone who…" chips={CHIPS.q1} value={form.q1} onChange={v => set('q1', v)} />
        <QuestionBlock label="What's the one thing that matters most?" sub="One thing. Not a list." field="q2" placeholder="The one thing is…" chips={CHIPS.q2} value={form.q2} onChange={v => set('q2', v)} />
        <QuestionBlock label="What's my energy level — and what's driving it?" sub="Name it accurately. You can only manage what you can see." field="q3" placeholder="My energy is… because…" chips={CHIPS.q3} value={form.q3} onChange={v => set('q3', v)} />
        <QuestionBlock label="What pattern am I watching for today?" sub="Name it before it shows up. That's the practice." field="q4" placeholder="The pattern I'm watching for is…" chips={CHIPS.q4} value={form.q4} onChange={v => set('q4', v)} />
        <QuestionBlock label="What standard am I holding myself to today?" sub="Not a goal. A non-negotiable." field="q5" placeholder="My standard today is…" chips={CHIPS.q5} value={form.q5} onChange={v => set('q5', v)} />
        <QuestionBlock label="What would make today a win?" sub="Be specific. Vague intentions produce vague outcomes." field="q6" placeholder="Today is a win if…" chips={CHIPS.q6} value={form.q6} onChange={v => set('q6', v)} />

        <button className="btn btn-blue" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save morning check-in'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
