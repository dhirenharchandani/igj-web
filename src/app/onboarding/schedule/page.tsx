'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SchedulePage() {
  const router = useRouter()
  const [morningTime, setMorningTime] = useState('07:00')
  const [eveningTime, setEveningTime] = useState('21:00')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        morning_time: morningTime + ':00',
        evening_time: eveningTime + ':00',
        onboarding_done: true,
      })
    }
    setSaving(false)
    router.push('/dashboard')
  }

  const labelStyle: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 8, display: 'block' }
  const inputStyle: React.CSSProperties = { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', width: '100%', cursor: 'pointer' }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 40 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: i === 4 ? 20 : 8, height: 8, borderRadius: 4, background: i === 4 ? 'var(--purple)' : 'var(--bg3)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 className="question" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 10 }}>When will you show up?</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 40 }}>Setting a specific time makes you 2× more likely to follow through.</p>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Morning check-in</label>
          <input type="time" value={morningTime} onChange={e => setMorningTime(e.target.value)} style={inputStyle} />
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>Your day starts here. Before the noise.</p>
        </div>

        <div style={{ marginBottom: 40 }}>
          <label style={labelStyle}>Evening check-in</label>
          <input type="time" value={eveningTime} onChange={e => setEveningTime(e.target.value)} style={inputStyle} />
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>Your day ends here. What did it reveal?</p>
        </div>

        <div style={{ padding: '16px 18px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            🔔 You&apos;ll receive a reminder at your set times. <br />
            Morning: <strong style={{ color: 'var(--text-primary)' }}>&quot;Your morning check-in is ready.&quot;</strong><br />
            Evening: <strong style={{ color: 'var(--text-primary)' }}>&quot;Take 5 minutes to reflect on your day.&quot;</strong>
          </p>
        </div>

        <button className="btn btn-purple" onClick={save} disabled={saving} style={{ marginTop: 'auto' }}>
          {saving ? 'Saving…' : 'Set my schedule →'}
        </button>
      </div>
    </div>
  )
}
