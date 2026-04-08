'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/scoring'

export function useCheckinStatus() {
  const [status, setStatus] = useState({
    morningDone: false,
    eveningDone: false,
    scorecardDone: false,
    weeklyResetDone: false,
    eveningTime: '21:00', // default fallback
    loading: true,
  })

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const weekStart = getWeekStart()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStatus(s => ({ ...s, loading: false })); return }

    const [m, e, sc, w, profile] = await Promise.all([
      supabase.from('morning_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('evening_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('daily_scorecards').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('weekly_resets').select('id').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
      supabase.from('user_profiles').select('evening_time').eq('id', user.id).maybeSingle(),
    ])

    // evening_time stored as "21:00:00" — normalise to "HH:MM"
    const rawTime: string = profile.data?.evening_time ?? '21:00:00'
    const eveningTime = rawTime.slice(0, 5)

    setStatus({
      morningDone: !!m.data,
      eveningDone: !!e.data,
      scorecardDone: !!sc.data,
      weeklyResetDone: !!w.data,
      eveningTime,
      loading: false,
    })
  }, [])

  useEffect(() => {
    refresh()

    // Re-fetch whenever the tab becomes visible again (e.g. returning from check-in)
    const handleVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refresh])

  return { ...status, refresh }
}
