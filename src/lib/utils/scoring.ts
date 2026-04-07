export function getLowestDimension(scores: Record<string, number>): string {
  return Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => a - b)[0]?.[0] ?? ''
}

export function computeAverage(scores: Record<string, number>): number {
  const values = Object.values(scores).filter(v => v > 0)
  if (!values.length) return 0
  return parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
}

export function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function isSunday(date = new Date()): boolean {
  return date.getDay() === 0
}

export function getScoreColor(score: number, max = 5): string {
  const pct = score / max
  if (pct <= 0.4) return 'var(--coral)'
  if (pct <= 0.7) return 'var(--amber)'
  return 'var(--teal)'
}
