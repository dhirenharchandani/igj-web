import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { streakDays } = await req.json()

  const [{ data: profile }, { data: savedInsights }, { data: scorecards }] = await Promise.all([
    supabase.from('user_profiles').select('identity_gap_text').eq('id', user.id).single(),
    supabase.from('daily_insights').select('insight_text, date').eq('user_id', user.id).eq('is_saved', true).order('date', { ascending: false }).limit(5),
    supabase.from('daily_scorecards').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(streakDays),
  ])

  const dims = ['awareness', 'intention', 'state', 'presence', 'ownership']
  const avgs = dims.map(d => {
    const vals = (scorecards || []).map((s: Record<string, unknown>) => s[d] as number).filter(Boolean)
    const avg = vals.length
      ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1)
      : '—'
    return `${d}: ${avg}/5`
  }).join(', ')

  const systemPrompt = `You are an inner game coach. The user has completed ${streakDays} consecutive days of journaling.

On Day 1, they described their gap as: "${profile?.identity_gap_text || '—'}"

Last ${streakDays} days average scorecard: ${avgs}
Recent saved insights: ${(savedInsights || []).slice(0, 3).map((i: { insight_text: string }) => `"${i.insight_text}"`).join(' | ')}

Write one paragraph (4-5 sentences):
1. What ${streakDays} days of data reveals about their original gap — are they closing it or maintaining it?
2. The most consistent pattern across their entries
3. What has measurably shifted vs what has not
4. End with one direct question they should sit with

Never celebrate the streak itself. The pattern awareness is what matters, not the count.`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 400,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate my Day ${streakDays} milestone reflection.` },
    ],
  })

  const summary = response.choices[0].message.content ?? ''
  return NextResponse.json({ summary, streakDays })
}
