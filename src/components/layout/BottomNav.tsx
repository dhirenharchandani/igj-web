'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/dashboard',          label: 'Home'     },
  { href: '/checkin/morning',    label: 'Daily'    },
  { href: '/weekly/data-bridge', label: 'Weekly'   },
  { href: '/learn',              label: 'Learn'    },
  { href: '/patterns',           label: 'Patterns' },
  { href: '/settings',           label: 'Settings' },
]

export function BottomNav() {
  const path = usePathname()

  return (
    <nav
      style={{
        display: 'flex',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        alignItems: 'center',
      }}
    >
      {LINKS.map(link => {
        const active = path === link.href || path.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {link.label}
            </span>
            {active && (
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--teal)' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
