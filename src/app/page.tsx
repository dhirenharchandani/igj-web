'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/onboarding/identity')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14,
    padding: '16px', fontSize: 15, color: 'var(--text-primary)', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }

  const AuthForm = ({ id }: { id: string }) => (
    <form id={id} onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Email address" required style={inputStyle} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="Password" required minLength={6} style={inputStyle} />
      {error && <p style={{ fontSize: 13, color: 'var(--coral)', textAlign: 'center' }}>{error}</p>}
      <button type="submit" className="btn btn-teal" disabled={loading || !email.trim() || !password.trim()}>
        {loading ? '…' : mode === 'signup' ? 'Create account →' : 'Sign in →'}
      </button>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          {mode === 'signin' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </form>
  )

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* Hero */}
      <section style={{ padding: '72px 28px 52px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 28 }}>Inner Game Journal</p>
        <h1 className="question" style={{ fontSize: 40, lineHeight: 1.18, color: 'var(--text-primary)', marginBottom: 20 }}>
          You already know what to do. So why aren&apos;t you doing it?
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 44 }}>
          The Inner Game Journal is where that gap gets examined.
        </p>
        <AuthForm id="hero-form" />
      </section>

      {/* Problem */}
      <section style={{ padding: '0 28px 56px' }}>
        {['You set intentions. You don\'t follow through.', 'You know the pattern. You repeat it anyway.', 'The problem isn\'t knowledge. It\'s the inner game running underneath all of it.'].map((line, i) => (
          <p key={i} style={{ fontSize: 17, color: i < 2 ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.65, marginBottom: 14, fontWeight: i === 2 ? 500 : 400 }}>{line}</p>
        ))}
      </section>

      {/* Not / Is */}
      <section style={{ padding: '0 28px 56px' }}>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-tertiary)', marginBottom: 16 }}>This is not</p>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal)', marginBottom: 16, paddingLeft: 12 }}>This is</p>
            {[['A productivity planner', 'A self-awareness tool'], ['A goal tracker', 'A pattern detector'], ['Another habit app', 'A mirror you use daily'], ['Motivation', 'Examination']].map(([n, is]) => (
              <>
                <p key={n} style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 12, paddingRight: 12, borderRight: '1px solid var(--border)' }}>{n}</p>
                <p key={is} style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12, paddingLeft: 12 }}>{is}</p>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 28px 56px' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-tertiary)', marginBottom: 28 }}>How it works</p>
        {[
          { step: 'Morning', desc: 'Set your intention and name the pattern you\'re watching for.' },
          { step: 'Evening', desc: 'Examine the gap between what you intended and what actually happened.' },
          { step: 'Weekly', desc: 'See what your patterns reveal about who you\'re being, not just what you\'re doing.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{i + 1}</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.step}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Social proof */}
      <section style={{ padding: '0 28px 56px' }}>
        {[
          { quote: 'I noticed I was setting the same morning intention for three weeks in a row. That\'s when I realized the problem wasn\'t my planning. It was what I was avoiding.', attr: 'Entrepreneur, Dubai' },
          { quote: 'Most journaling feels like venting. This one feels like being cross-examined. I didn\'t expect to find that useful — but I do.', attr: 'Performance coach, London' },
          { quote: 'My coach recommended this. I thought it would be soft. It isn\'t.', attr: 'Professional athlete' },
        ].map((t, i) => (
          <div key={i} className="card accent-gray" style={{ marginBottom: 16 }}>
            <p className="question" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>&ldquo;{t.quote}&rdquo;</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>— {t.attr}</p>
          </div>
        ))}
      </section>

      {/* Final CTA */}
      <section style={{ padding: '0 28px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.55 }}>Your patterns don&apos;t wait for the right moment.</p>
        <AuthForm id="footer-form" />
      </section>
    </div>
  )
}
