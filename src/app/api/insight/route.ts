import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date } = await req.json()

  const [{ data: morning }, { data: evening }, { data: scorecard }, { data: profile }] = await Promise.all([
    supabase.from('morning_checkins').select('*').eq('user_id', user.id).eq('date', date).single(),
    supabase.from('evening_checkins').select('*').eq('user_id', user.id).eq('date', date).single(),
    supabase.from('daily_scorecards').select('*').eq('user_id', user.id).eq('date', date).single(),
    supabase.from('user_profiles').select('identity_gap_text').eq('id', user.id).single(),
  ])

  const dims = {
    awareness: scorecard?.awareness,
    intention: scorecard?.intention,
    state: scorecard?.state,
    presence: scorecard?.presence,
    ownership: scorecard?.ownership,
  }
  const lowestDimension = Object.entries(dims)
    .filter(([, v]) => v)
    .sort(([, a], [, b]) => (a as number) - (b as number))[0]?.[0] ?? ''

  const systemPrompt = `You are an inner game coach. Your job is to identify behavioral and emotional patterns — not to affirm or encourage.

The user described their core gap on Day 1 as: "${profile?.identity_gap_text || 'not yet provided'}"

Today's data:
- Morning intention: "${morning?.q1_intention || '—'}"
- Morning focus: "${morning?.q2_focus || '—'}"
- Morning energy: "${morning?.q3_energy || '—'}"
- Pattern watching: "${morning?.q4_pattern || '—'}"
- Evening — delivered: "${evening?.q1_delivered || '—'}"
- Evening — pattern that showed up: "${evening?.q2_pattern || '—'}"
- Evening — gap: "${evening?.q3_gap || '—'}"
- Evening — learning: "${evening?.q4_learning || '—'}"
- Scorecard: Awareness ${dims.awareness}/5, Intention ${dims.intention}/5, State ${dims.state}/5, Presence ${dims.presence}/5, Ownership ${dims.ownership}/5
- Lowest dimension: ${lowestDimension}

Write 2-3 sentences identifying ONE specific pattern worth the user's attention today.
Rules:
- Reference actual data — name the lowest dimension and connect it to something they wrote
- Be direct. Never open with praise.
- Never use: "great", "amazing", "proud", "well done", "fantastic"
- Sound like a coach who has read their journal, not a chatbot
- End with one precise question, not a motivational statement`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 300,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate my daily pattern insight.' },
    ],
  })

  const insight = response.choices[0].message.content ?? ''

  await supabase.from('daily_insights').upsert({
    user_id: user.id,
    date,
    insight_text: insight,
    lowest_dimension: lowestDimension,
  })

  return NextResponse.json({ insight, lowestDimension })
}
