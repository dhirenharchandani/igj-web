export type Theme = 'light' | 'dark';

export interface AssessmentScores {
  body_energy: number;
  mind_dialogue: number;
  intimacy_presence: number;
  family_roots: number;
  circle_influence: number;
  purpose_impact: number;
  experiences_aliveness: number;
  inner_alignment: number;
  wealth_responsibility: number;
  growth_curiosity: number;
}

export interface OnboardingState {
  intro_completed: boolean;
  pillars_viewed: boolean;
  assessment_completed: boolean;
  assessment_scores: AssessmentScores;
}

export interface MorningEntry {
  intention: string;
  gratitude: [string, string, string];
  q1: string; // The one thing that will make today matter
  q2: string; // The identity I'm stepping into
  q3: string; // Who needs the best version of me
  q4: string; // What could knock me off my inner game
  q4_response: string; // How my grounded self handles it
  q5: string; // One person I'll make feel seen
  q6: string; // The one move that reflects who I'm becoming
  q7: string; // Where I'll stretch past what's comfortable
  q8: string; // What my inner coach needs me to remember
  q9: string; // What I'm building I can't lose sight of
  q10: string; // Tonight I'll know I won the inner game if
  insight?: string;
  completed: boolean;
}

export interface EveningEntry {
  q1: string; // The moment today I was most present for
  q2: string; // Where I showed up as my best self
  q3: string; // The insight today I don't want to lose
  q4: string; // If I could replay today I'd change
  q5: string; // What I held back today
  q6: string; // What my inner coach says
  insight?: string;
  completed: boolean;
}

export interface ScorecardEntry {
  awareness: number;   // 0–5
  intention: number;
  state: number;
  presence: number;
  ownership: number;
  authenticity: number;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  entry_date: string; // YYYY-MM-DD
  morning: MorningEntry;
  evening: EveningEntry;
  scorecard: ScorecardEntry;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  display_name: string;
  timezone: string;
  theme: Theme;
}

export interface WeeklyScorecard {
  clarity: number;   // 0–5
  ownership: number;
  presence: number;
  standards: number;
  courage: number;
  growth: number;
}

export interface WeeklyEntry {
  id: string;
  week_start: string; // YYYY-MM-DD (Monday)
  // S1 - Reality Check
  rc_what_happened: string;
  rc_wins: string;
  rc_fell_short: string;
  rc_knew_better: string;
  // S2 - The Inner Game
  ig_patterns: string;
  ig_driving: string;
  ig_higher_self: string;
  ig_default_self: string;
  ig_insight: string;
  // S3 - Decisions → Actions
  da_moved_forward: string;
  da_delayed: string;
  da_said_yes: string;
  da_busy: string;
  da_insight: string;
  // S4 - Energy & Presence
  ep_best: string;
  ep_flat: string;
  ep_protect: string;
  ep_showed_up: string;
  ep_insight: string;
  // S5 - Standards
  st_operated: string;
  st_lowered: string;
  st_tolerated: string;
  st_insight: string;
  // S6 - Impact & Leadership
  il_impacted: string;
  il_avoided: string;
  il_clarity: string;
  il_insight: string;
  // S7 - Weekly Scorecard
  scorecard: WeeklyScorecard;
  // The Cost
  cost_financial: string;
  cost_emotional: string;
  // Reset
  reset_tolerating: string;
  reset_must_change: string;
  reset_stop: [string, string];
  reset_automate: [string, string];
  reset_delegate: [string, string];
  // Non-Negotiables
  nn: [string, string, string];
  // Final Truth
  pattern_changing: string;
  // AI insight
  insight?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
