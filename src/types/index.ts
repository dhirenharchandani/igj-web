export interface UserProfile {
  id: string
  email: string | null
  display_name: string | null
  focus_pillar: 'inner_clarity' | 'identity_beliefs' | 'emotional_resilience' | null
  identity_gap_text: string | null
  morning_time: string
  evening_time: string
  timezone: string
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_checkin_date: string | null
  updated_at: string
}

export interface MorningCheckin {
  id: string
  user_id: string
  date: string
  gratitude_entry: string | null
  q1_intention: string | null
  q2_focus: string | null
  q3_energy: string | null
  q4_pattern: string | null
  q5_standard: string | null
  q6_win: string | null
  is_abbreviated: boolean
  created_at: string
}

export interface EveningCheckin {
  id: string
  user_id: string
  date: string
  q1_delivered: string | null
  q2_pattern: string | null
  q3_gap: string | null
  q4_learning: string | null
  q5_tomorrow: string | null
  created_at: string
}

export interface DailyScorecard {
  id: string
  user_id: string
  date: string
  awareness: number
  intention: number
  state: number
  presence: number
  ownership: number
  total: number
  created_at: string
}

export interface DailyInsight {
  id: string
  user_id: string
  date: string
  insight_text: string
  lowest_dimension: string | null
  is_saved: boolean
  created_at: string
}

export interface WeeklyReset {
  id: string
  user_id: string
  week_start: string
  [key: string]: string | null | undefined
}

export interface WeeklyScorecard {
  id: string
  user_id: string
  week_start: string
  clarity: number
  ownership: number
  presence: number
  standards: number
  courage: number
  growth: number
  total: number
  created_at: string
}

export interface WeeklyReflection {
  id: string
  user_id: string
  week_start: string
  reflection_text: string
  suggested_shift: string | null
  next_week_focus: string | null
  created_at: string
}

export interface LifeAssessment {
  id: string
  user_id: string
  body_energy: number
  mind_dialogue: number
  intimacy: number
  family: number
  circle: number
  purpose: number
  experiences: number
  alignment: number
  wealth: number
  growth: number
  created_at: string
}
