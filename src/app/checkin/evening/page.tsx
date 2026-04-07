'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

const PATTERN_CHIPS = ['Avoidance', 'Overthinking', 'Reactivity', 'People-pleasing', 'Distraction', 'Seeking validation']

interface Form { q1: string; q2: string; q3: string; q4: string; q5: string }

export default function EveningPage() {
  const router = useRouter()
  const [morningIntention, setMorningIntention] = useState('')
  const [morningDone, setMorningDone] = useState(false)
  const [form, setForm] = useState<Form>({ q1: '', q2: '', q3: '', q4: '', q5: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('morning_checkins').select('q1_intention').eq('user_id', user.id).eq('date', today).single()
      if (data?.q1_intention) { setMorningIntention(data.q1_intention); setMorningDone(true) }
    }
    load()
  }, [])

  function set(k: keyof Form, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    if (user) {
      await supabase.from('evening_checkins').upsert({
        user_id: user.id, date: today,
        q1_delivered: form.q1,
        q2_pattern: form.q2,
        q3_gap: form.q3,
        q4_learning: form.q4,
        q5_tomorrow: form.q5,
      })
    }
    setSaving(false)
    router.push('/checkin/scorecard')
  }

  const Q = ({ label, sub, field, placeholder, chips }: { label: string; sub: string; field: keyof Form; placeholder: string; chips?: string[] }) => (
    <div style={{ marginBottom: 32 }}>
      <h3 className="question" style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>{label}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{sub}</p>
      <textarea className="focus-blue" value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} rows={3} />
      {chips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {chips.map(c => <button key={c} className="chip" onClick={() => set(field, form[field] ? form[field] + ', ' + c : c)}>{c}</button>)}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div className="tab-bar">
        <Link href="/checkin/morning" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Morning</button>
        </Link>
        <button className="active">Evening</button>
        <Link href="/checkin/scorecard" style={{ textDecoration: 'none', flex: 1 }}>
          <button style={{ width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' }}>Scorecard</button>
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
        {/* Morning mirror */}
        {morningDone ? (
          <div className="card" style={{ marginBottom: 28, background: 'var(--bg3)' }}>
            <p className="question" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              This morning you said you needed to be: <em>&ldquo;{morningIntention}&rdquo;</em>
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: 'var(--amber)' }}>You haven&apos;t done your morning check-in yet. That&apos;s okay — answer these from memory.</p>
          </div>
        )}

        <Q label="Did I show up as the person I said I'd be this morning?" sub="Not pass or fail. Just honest." field="q1" placeholder="I showed up as… / I didn't show up as…" />

        <div style={{ marginBottom: 32 }}>
          <h3 className="question" style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>What pattern showed up today that I didn&apos;t want?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Name the pattern, not just the event. Avoidance. Overthinking. Control. Distraction. Validation-seeking.</p>
          <textarea className="focus-blue" value={form.q2} onChange={e => set('q2', e.target.value)} placeholder="The pattern that showed up was…" rows={3} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {PATTERN_CHIPS.map(c => <button key={c} className="chip" onClick={() => set('q2', c)}>{c}</button>)}
          </div>
        </div>

        <Q label="Where was the gap between my intention and my execution?" sub="Be specific. 'Everywhere' isn't an answer. When? Under what conditions?" field="q3" placeholder="The gap lived in…" />
        <Q label="What's the one thing I'm taking from today?" sub="One thing. Distill it." field="q4" placeholder="Today taught me…" />
        <Q label="What needs to shift tomorrow?" sub="Not a to-do list. What actually needs to change — in how you think, respond, or operate?" field="q5" placeholder="Tomorrow I need to shift…" />

        <button className="btn btn-blue" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Complete evening →'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
