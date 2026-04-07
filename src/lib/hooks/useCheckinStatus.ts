'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/scoring'

export function useCheckinStatus() {
  const [status, setStatus] = useState({
    morningDone: false,
    eveningDone: false,
    scorecardDone: false,
    weeklyResetDone: false,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const weekStart = getWeekStart()

    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStatus(s => ({ ...s, loading: false })); return }

      const [m, e, s, w] = await Promise.all([
        supabase.from('morning_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('evening_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('daily_scorecards').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('weekly_resets').select('id').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
      ])
      setStatus({
        morningDone: !!m.data,
        eveningDone: !!e.data,
        scorecardDone: !!s.data,
        weeklyResetDone: !!w.data,
        loading: false,
      })
    }
    fetch()
  }, [])

  return status
}
