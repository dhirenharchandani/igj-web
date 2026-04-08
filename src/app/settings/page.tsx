'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'

export default function SettingsPage() {
  const router = useRouter()
  const { profile, setTheme } = useStore()
  const isDark = profile.theme === 'dark'

  const [morningTime, setMorningTime] = useState('07:00')
  const [eveningTime, setEveningTime] = useState('21:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('user_profiles')
        .select('morning_time, evening_time')
        .eq('id', user.id)
        .single()
      if (data) {
        setMorningTime((data.morning_time ?? '07:00:00').slice(0, 5))
        setEveningTime((data.evening_time ?? '21:00:00').slice(0, 5))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        morning_time: morningTime + ':00',
        evening_time: eveningTime + ':00',
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'var(--text-tertiary)', marginBottom: 8, display: 'block',
  }
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14,
    padding: '16px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit', width: '100%', cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20, padding: 0, lineHeight: 1 }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Settings</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>

        {/* Check-in times */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Check-in Schedule
          </p>

          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading…</p>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>☀️  Morning check-in</label>
                <input
                  type="time"
                  value={morningTime}
                  onChange={e => setMorningTime(e.target.value)}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  Set the field for the day — before the noise begins.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>🌙  Evening check-in</label>
                <input
                  type="time"
                  value={eveningTime}
                  onChange={e => setEveningTime(e.target.value)}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  The evening button on your dashboard activates at this time.
                </p>
              </div>

              <button className="btn btn-teal" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save schedule'}
              </button>
              {saved && (
                <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--teal)', fontSize: 13, fontWeight: 500 }}>
                  ✓ Schedule updated.
                </p>
              )}
            </>
          )}
        </div>

        {/* Appearance */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Appearance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                {isDark ? 'Dark mode' : 'Light mode'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              </p>
            </div>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              style={{
                background: isDark ? 'var(--teal)' : 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 18,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Account
          </p>
          <button
            onClick={signOut}
            style={{
              width: '100%', padding: '16px', borderRadius: 14, fontSize: 15, fontWeight: 500,
              background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--coral)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Sign out
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
