'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/scoring'

function getTodayFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false
  const today = new Date().toISOString().split('T')[0]
  return localStorage.getItem(key) === today
}

export function useCheckinStatus() {
  const [status, setStatus] = useState(() => ({
    // Seed synchronously from localStorage — no async delay, no flash of wrong state
    morningDone: getTodayFromStorage('igj_morning_done_date'),
    eveningDone: getTodayFromStorage('igj_evening_done_date'),
    scorecardDone: getTodayFromStorage('igj_scorecard_done_date'),
    weeklyResetDone: false,
    eveningTime: '21:00',
    loading: true,
  }))

  // Use a refresh counter so callers can force a re-fetch
  const [refreshCount, setRefreshCount] = useState(0)
  const refresh = useCallback(() => setRefreshCount(n => n + 1), [])

  // Track whether we've done at least one fetch
  const hasFetched = useRef(false)

  useEffect(() => {
    // Reset to loading on every refresh so stale values never show
    if (hasFetched.current) {
      setStatus(s => ({ ...s, loading: true }))
    }

    let cancelled = false

    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const weekStart = getWeekStart()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setStatus(s => ({ ...s, loading: false })); return }

      const [m, e, sc, w, profile] = await Promise.all([
        supabase.from('morning_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('evening_checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('daily_scorecards').select('id').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('weekly_resets').select('id').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
        supabase.from('user_profiles').select('evening_time').eq('id', user.id).maybeSingle(),
      ])

      if (cancelled) return

      const rawTime: string = profile.data?.evening_time ?? '21:00:00'
      hasFetched.current = true

      setStatus({
        morningDone: !!m.data,
        eveningDone: !!e.data,
        scorecardDone: !!sc.data,
        weeklyResetDone: !!w.data,
        eveningTime: rawTime.slice(0, 5),
        loading: false,
      })
    }

    load()
    return () => { cancelled = true }
  }, [refreshCount])

  useEffect(() => {
    // Re-fetch when the tab regains visibility (user switches back to browser tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refresh])

  return { ...status, refresh }
}
