'use client'

interface RatingScaleProps {
  value: number
  onChange: (v: number) => void
  max?: number
  labels?: { low: string; mid: string; high: string }
}

function getDotClass(i: number, value: number, max: number): string {
  if (i > value) return ''
  const pct = value / max
  if (pct <= 0.4) return 'selected-coral'
  if (pct <= 0.6) return 'selected-amber'
  return 'selected-blue'
}

export function DotRating({ value, onChange, max = 5 }: RatingScaleProps) {
  return (
    <div className="dot-rating">
      {Array.from({ length: max }, (_, i) => i + 1).map(i => (
        <button
          key={i}
          type="button"
          className={getDotClass(i, value, max)}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </div>
  )
}

interface BarRatingProps {
  value: number
  onChange: (v: number) => void
  max?: number
}

export function BarRating({ value, onChange, max = 10 }: BarRatingProps) {
  function getColor(v: number): string {
    if (v <= 3) return 'var(--coral)'
    if (v <= 6) return 'var(--amber)'
    return 'var(--teal)'
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: max }, (_, i) => i + 1).map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 8,
              background: i <= value ? getColor(value) : 'var(--bg3)',
              border: `1px solid ${i <= value ? getColor(value) : 'var(--border)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontSize: 12,
              fontWeight: 600,
              color: i <= value ? (value <= 6 ? '#0e0e0c' : '#fff') : 'var(--text-tertiary)',
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(value / max) * 100}%`,
            background: getColor(value),
            borderRadius: 4,
            transition: 'width 0.3s ease, background 0.2s',
          }}
        />
      </div>
    </div>
  )
}
