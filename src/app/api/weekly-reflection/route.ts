import Groq from 'groq-sdk'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  let dataClient: ReturnType<typeof createSupabaseClient>
  let userId: string

  const authHeader = req.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    // ── Mobile app: JWT token in Authorization header ──
    const token = authHeader.substring(7)
    const verifier = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await verifier.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id
    dataClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
  } else {
    // ── Web app: cookie-based auth ──
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id
    dataClient = supabase as unknown as ReturnType<typeof createSupabaseClient>
  }

  const { weekStart } = await req.json()

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const [{ data: reset }, { data: weeklyScore }, { data: dailyScores }, { data: profile }] = await Promise.all([
    dataClient.from('weekly_resets').select('*').eq('user_id', userId).eq('week_start', weekStart).maybeSingle(),
    dataClient.from('weekly_scorecards').select('*').eq('user_id', userId).eq('week_start', weekStart).maybeSingle(),
    dataClient.from('daily_scorecards').select('*').eq('user_id', userId).gte('date', weekStart).lte('date', weekEndStr),
    dataClient.from('user_profiles').select('identity_gap_text').eq('id', userId).maybeSingle(),
  ])

  const dimAvgs = ['awareness', 'intention', 'state', 'presence', 'ownership'].map(dim => {
    const scores = (dailyScores || []).map((d: Record<string, unknown>) => d[dim] as number).filter(Boolean)
    const avg = scores.length
      ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)
      : '—'
    return `${dim}: ${avg}/5`
  }).join(', ')

  const systemPrompt = `You are an inner game coach doing a weekly debrief.

User's original gap (Day 1): "${profile?.identity_gap_text || '—'}"

Weekly reset entries:
- Reality check: "${reset?.s1_what_happened || '—'}"
- Patterns this week: "${reset?.s2_patterns || '—'}"
- Pattern drivers: "${reset?.s2_drivers || '—'}"
- Decisions made vs avoided: "${reset?.s3_moved_forward || '—'} / ${reset?.s3_delayed || '—'}"
- Energy: "${reset?.s4_energy_best || '—'}"
- Standards held vs lowered: "${reset?.s5_at_standard || '—'} / ${reset?.s5_lowered || '—'}"
- Cost if this continues: "${reset?.s7_cost_90 || '—'}"

Weekly scorecard: Clarity ${weeklyScore?.clarity}/5, Ownership ${weeklyScore?.ownership}/5, Presence ${weeklyScore?.presence}/5, Standards ${weeklyScore?.standards}/5, Courage ${weeklyScore?.courage}/5, Growth ${weeklyScore?.growth}/5
Daily dimension averages: ${dimAvgs}

Write 3-4 sentences identifying the dominant pattern of the week — the gap between intention and execution, the emotional driver underneath it, and one specific shift the user could make next week. Be precise. Reference the data. No generic motivation. No praise.

Then on a new line write exactly: "SHIFT: [one behavioral sentence as the suggested next-week shift]"`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate my weekly reflection.' },
    ],
  })

  const fullText = response.choices[0].message.content ?? ''
  const shiftIdx = fullText.indexOf('\nSHIFT:')
  const reflection = shiftIdx > -1 ? fullText.slice(0, shiftIdx).trim() : fullText.trim()
  const shiftLine = shiftIdx > -1 ? fullText.slice(shiftIdx + 7).trim() : ''

  await dataClient.from('weekly_reflections').upsert({
    user_id: userId,
    week_start: weekStart,
    reflection_text: reflection,
    suggested_shift: shiftLine,
  })

  return NextResponse.json({ reflection, suggestedShift: shiftLine })
}
