'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AppHeaderProps {
  streak?: number
  showBack?: boolean
  onBack?: () => void
  title?: string
  color?: string
}

export function AppHeader({ streak, showBack, onBack, title, color = 'var(--teal)' }: AppHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button
            onClick={onBack}
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >
            ←
          </button>
        )}
        {title ? (
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        ) : (
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color }}>IGJ</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {streak !== undefined && (
          <Link href="/patterns" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{streak} day{streak !== 1 ? 's' : ''}</span>
            </div>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
}
