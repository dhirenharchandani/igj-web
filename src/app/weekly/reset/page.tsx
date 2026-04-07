'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/scoring'
import { BottomNav } from '@/components/layout/BottomNav'

type ResetData = Record<string, string>

const SECTIONS = [
  {
    num: 1, title: 'Reality Check', sub: 'What actually happened this week? Facts. Not stories.',
    fields: [
      { key: 's1_what_happened', label: 'What actually happened this week?', placeholder: 'The facts of this week were…' },
      { key: 's1_wins', label: 'Where did I win?', placeholder: 'I won at…' },
      { key: 's1_fell_short', label: 'Where did I fall short?', placeholder: 'I fell short at…' },
      { key: 's1_knew_better', label: 'Where did I know better… and still not do it?', placeholder: 'I knew better but…' },
    ],
  },
  {
    num: 2, title: 'The Inner Game', sub: 'The pattern underneath the pattern.',
    fields: [
      { key: 's2_patterns', label: 'What patterns showed up this week?', placeholder: 'avoidance, overthinking, control, distraction, validation…' },
      { key: 's2_drivers', label: 'What was driving them?', placeholder: 'fear, ego, uncertainty, comfort, lack of clarity…' },
      { key: 's2_higher_self', label: 'Where did I act from my higher self?', placeholder: '' },
      { key: 's2_default_self', label: 'Where did I act from my default self?', placeholder: '' },
    ],
    callout: { key: 's2_pattern_focus', label: 'The pattern that matters most right now:' },
  },
  {
    num: 3, title: 'Decisions > Actions', sub: 'Busy is not the same as effective.',
    fields: [
      { key: 's3_moved_forward', label: 'What decisions moved my life or business forward?', placeholder: '' },
      { key: 's3_delayed', label: 'What decisions did I delay or avoid?', placeholder: '' },
      { key: 's3_said_yes', label: 'Where did I say yes when I should have said no?', placeholder: '' },
      { key: 's3_stayed_busy', label: 'Where did I stay busy instead of being effective?', placeholder: '' },
    ],
    callout: { key: 's3_avoided_decision', label: 'One decision I\'ve been avoiding:' },
  },
  {
    num: 4, title: 'Energy & Presence', sub: 'Energy is the asset. How did you manage it?',
    fields: [
      { key: 's4_energy_best', label: 'When was my energy at its best?', placeholder: '' },
      { key: 's4_energy_flat', label: 'When did I feel flat, distracted, or off?', placeholder: '' },
      { key: 's4_energy_protected', label: 'Did I protect my energy… or leak it?', placeholder: '' },
      { key: 's4_showed_up', label: 'How did I show up in the rooms that mattered?', placeholder: '' },
    ],
    callout: { key: 's4_energy_shift', label: 'One shift to elevate my baseline energy:' },
  },
  {
    num: 5, title: 'Standards', sub: 'Where you lower the bar is where the pattern lives.',
    fields: [
      { key: 's5_at_standard', label: 'Where did I operate at my standard?', placeholder: '' },
      { key: 's5_lowered', label: 'Where did I lower it — even slightly?', placeholder: '' },
      { key: 's5_tolerated', label: 'What did I tolerate that I shouldn\'t have?', placeholder: '' },
    ],
    callout: { key: 's5_standard_commit', label: 'The standard I\'m no longer negotiating:' },
  },
  {
    num: 6, title: 'Impact & Leadership', sub: 'How you show up for others is a mirror.',
    fields: [
      { key: 's6_impacted', label: 'Who did I positively impact this week?', placeholder: '' },
      { key: 's6_avoided_truth', label: 'Where did I avoid a conversation or truth?', placeholder: '' },
      { key: 's6_clarity', label: 'Did I create clarity… or confusion?', placeholder: '' },
    ],
    callout: { key: 's6_conversation', label: 'One conversation I need to have:' },
  },
  {
    num: 7, title: 'The Cost + Reset', sub: 'Honesty is where change starts.',
    fields: [
      { key: 's7_cost_90', label: 'If I keep operating like this for 90 days… what happens?', placeholder: '' },
      { key: 's7_cost_detail', label: 'What does it cost me — financially, emotionally, relationally?', placeholder: '' },
      { key: 's7_done_tolerating', label: 'What am I done tolerating?', placeholder: '' },
      { key: 's7_must_change', label: 'What must change — immediately?', placeholder: '' },
    ],
    resetBlock: true,
  },
]

export default function WeeklyResetPage() {
  const router = useRouter()
  const [section, setSection] = useState(0)
  const [data, setData] = useState<ResetData>({})
  const [saving, setSaving] = useState(false)

  function set(k: string, v: string) { setData(d => ({ ...d, [k]: v })) }
  const s = SECTIONS[section]

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('weekly_resets').upsert({ user_id: user.id, week_start: getWeekStart(), ...data })
    }
    setSaving(false)
    router.push('/weekly/scorecard')
  }

  const progress = ((section) / SECTIONS.length) * 100

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header + progress */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--amber)' }}>Weekly Reset</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{section + 1}/{SECTIONS.length}</p>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((section + 1) / SECTIONS.length) * 100}%`, background: 'var(--amber)' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: 6 }}>Section {s.num}</p>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{s.title}</h2>
        <p className="question" style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>&ldquo;{s.sub}&rdquo;</p>

        {s.fields.map(f => (
          <div key={f.key} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10 }}>{f.label}</p>
            <textarea className="focus-amber" value={data[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || `${f.label}…`} rows={3} />
          </div>
        ))}

        {s.callout && (
          <div style={{ padding: '16px', background: 'var(--amber-dim)', borderRadius: 12, borderLeft: '3px solid var(--amber)', marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--amber)', marginBottom: 10 }}>{s.callout.label}</p>
            <textarea className="focus-amber" value={data[s.callout.key] ?? ''} onChange={e => set(s.callout!.key, e.target.value)} placeholder="Write it here…" rows={2} />
          </div>
        )}

        {s.resetBlock && (
          <div style={{ marginTop: 8 }}>
            {[
              { key: 's7_stop', label: 'Stop' },
              { key: 's7_automate', label: 'Automate' },
              { key: 's7_delegate', label: 'Delegate' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{f.label}:</p>
                <textarea className="focus-amber" value={data[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={`What I'll ${f.label.toLowerCase()}…`} rows={2} />
              </div>
            ))}
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, marginTop: 16 }}>Non-negotiables (3):</p>
            {[1, 2, 3].map(i => (
              <textarea key={i} className="focus-amber" value={data[`nonneg_${i}`] ?? ''} onChange={e => set(`nonneg_${i}`, e.target.value)} placeholder={`Non-negotiable ${i}…`} rows={2} style={{ marginBottom: 10 }} />
            ))}
            <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 12, marginTop: 8, marginBottom: 24 }}>
              <p className="question" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                &ldquo;You don&apos;t get the life you want. You get the life your patterns create. So the only real question is: what pattern am I changing next week?&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto', padding: '12px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
        {section > 0 && (
          <button className="btn btn-ghost" onClick={() => setSection(s => s - 1)} style={{ flex: '0 0 auto', width: 'auto', padding: '14px 20px' }}>←</button>
        )}
        {section < SECTIONS.length - 1 ? (
          <button className="btn btn-amber" onClick={() => setSection(s => s + 1)}>Next section →</button>
        ) : (
          <button className="btn btn-amber" onClick={finish} disabled={saving}>
            {saving ? 'Saving…' : 'Complete reset →'}
          </button>
        )}
      </div>
    </div>
  )
}
