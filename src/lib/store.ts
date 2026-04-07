import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  JournalEntry, MorningEntry, EveningEntry, ScorecardEntry,
  OnboardingState, UserProfile, AssessmentScores, Theme,
  WeeklyEntry, WeeklyScorecard,
} from './types';
import { getTodayDate, generateId } from './utils';

function emptyMorning(): MorningEntry {
  return {
    intention: '', gratitude: ['', '', ''],
    q1: '', q2: '', q3: '', q4: '', q4_response: '',
    q5: '', q6: '', q7: '', q8: '', q9: '', q10: '',
    completed: false,
  };
}

function emptyEvening(): EveningEntry {
  return { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', completed: false };
}

function emptyScorecard(): ScorecardEntry {
  return { awareness: 0, intention: 0, state: 0, presence: 0, ownership: 0, authenticity: 0, completed: false };
}

function emptyWeeklyScorecard(): WeeklyScorecard {
  return { clarity: 0, ownership: 0, presence: 0, standards: 0, courage: 0, growth: 0 };
}

function createEmptyWeeklyEntry(weekStart: string): WeeklyEntry {
  return {
    id: generateId(), week_start: weekStart,
    rc_what_happened: '', rc_wins: '', rc_fell_short: '', rc_knew_better: '',
    ig_patterns: '', ig_driving: '', ig_higher_self: '', ig_default_self: '', ig_insight: '',
    da_moved_forward: '', da_delayed: '', da_said_yes: '', da_busy: '', da_insight: '',
    ep_best: '', ep_flat: '', ep_protect: '', ep_showed_up: '', ep_insight: '',
    st_operated: '', st_lowered: '', st_tolerated: '', st_insight: '',
    il_impacted: '', il_avoided: '', il_clarity: '', il_insight: '',
    scorecard: emptyWeeklyScorecard(),
    cost_financial: '', cost_emotional: '',
    reset_tolerating: '', reset_must_change: '',
    reset_stop: ['', ''], reset_automate: ['', ''], reset_delegate: ['', ''],
    nn: ['', '', ''],
    pattern_changing: '',
    completed: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

function emptyAssessment(): AssessmentScores {
  return {
    body_energy: 0, mind_dialogue: 0, intimacy_presence: 0, family_roots: 0,
    circle_influence: 0, purpose_impact: 0, experiences_aliveness: 0,
    inner_alignment: 0, wealth_responsibility: 0, growth_curiosity: 0,
  };
}

function createEmptyEntry(date: string): JournalEntry {
  return {
    id: generateId(), entry_date: date,
    morning: emptyMorning(), evening: emptyEvening(), scorecard: emptyScorecard(),
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

interface Store {
  // Onboarding
  onboarding: OnboardingState;
  completeIntro: () => void;
  completePillars: () => void;
  completeAssessment: (scores: AssessmentScores) => void;

  // Journal
  entries: Record<string, JournalEntry>;
  activeTab: 'morning' | 'evening' | 'scorecard';
  currentDate: string;
  setActiveTab: (tab: 'morning' | 'evening' | 'scorecard') => void;
  setCurrentDate: (date: string) => void;
  updateMorning: (date: string, data: Partial<MorningEntry>) => void;
  updateEvening: (date: string, data: Partial<EveningEntry>) => void;
  updateScorecard: (date: string, data: Partial<ScorecardEntry>) => void;
  setInsight: (date: string, type: 'morning' | 'evening', insight: string) => void;
  getOrCreateEntry: (date: string) => JournalEntry;

  // Weekly
  weeklyEntries: Record<string, WeeklyEntry>;
  getOrCreateWeeklyEntry: (weekStart: string) => WeeklyEntry;
  updateWeeklyEntry: (weekStart: string, data: Partial<Omit<WeeklyEntry, 'scorecard'>>) => void;
  updateWeeklyScorecard: (weekStart: string, data: Partial<WeeklyScorecard>) => void;
  setWeeklyInsight: (weekStart: string, insight: string) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  setTheme: (theme: Theme) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      onboarding: {
        intro_completed: false,
        pillars_viewed: false,
        assessment_completed: false,
        assessment_scores: emptyAssessment(),
      },

      completeIntro: () =>
        set((s) => ({ onboarding: { ...s.onboarding, intro_completed: true } })),

      completePillars: () =>
        set((s) => ({ onboarding: { ...s.onboarding, pillars_viewed: true } })),

      completeAssessment: (scores) =>
        set((s) => ({
          onboarding: { ...s.onboarding, assessment_completed: true, assessment_scores: scores },
        })),

      entries: {},
      activeTab: 'morning',
      currentDate: getTodayDate(),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setCurrentDate: (date) => set({ currentDate: date }),

      getOrCreateEntry: (date) => {
        const { entries } = get();
        if (entries[date]) return entries[date];
        const entry = createEmptyEntry(date);
        set((s) => ({ entries: { ...s.entries, [date]: entry } }));
        return entry;
      },

      updateMorning: (date, data) =>
        set((s) => {
          const entry = s.entries[date] || createEmptyEntry(date);
          return {
            entries: {
              ...s.entries,
              [date]: {
                ...entry,
                morning: { ...entry.morning, ...data },
                updated_at: new Date().toISOString(),
              },
            },
          };
        }),

      updateEvening: (date, data) =>
        set((s) => {
          const entry = s.entries[date] || createEmptyEntry(date);
          return {
            entries: {
              ...s.entries,
              [date]: {
                ...entry,
                evening: { ...entry.evening, ...data },
                updated_at: new Date().toISOString(),
              },
            },
          };
        }),

      updateScorecard: (date, data) =>
        set((s) => {
          const entry = s.entries[date] || createEmptyEntry(date);
          return {
            entries: {
              ...s.entries,
              [date]: {
                ...entry,
                scorecard: { ...entry.scorecard, ...data },
                updated_at: new Date().toISOString(),
              },
            },
          };
        }),

      setInsight: (date, type, insight) =>
        set((s) => {
          const entry = s.entries[date] || createEmptyEntry(date);
          return {
            entries: {
              ...s.entries,
              [date]: {
                ...entry,
                [type]: { ...entry[type], insight },
                updated_at: new Date().toISOString(),
              },
            },
          };
        }),

      weeklyEntries: {},

      getOrCreateWeeklyEntry: (weekStart) => {
        const { weeklyEntries } = get();
        if (weeklyEntries[weekStart]) return weeklyEntries[weekStart];
        const entry = createEmptyWeeklyEntry(weekStart);
        set((s) => ({ weeklyEntries: { ...s.weeklyEntries, [weekStart]: entry } }));
        return entry;
      },

      updateWeeklyEntry: (weekStart, data) =>
        set((s) => {
          const entry = s.weeklyEntries[weekStart] || createEmptyWeeklyEntry(weekStart);
          return {
            weeklyEntries: {
              ...s.weeklyEntries,
              [weekStart]: { ...entry, ...data, updated_at: new Date().toISOString() },
            },
          };
        }),

      updateWeeklyScorecard: (weekStart, data) =>
        set((s) => {
          const entry = s.weeklyEntries[weekStart] || createEmptyWeeklyEntry(weekStart);
          return {
            weeklyEntries: {
              ...s.weeklyEntries,
              [weekStart]: {
                ...entry,
                scorecard: { ...entry.scorecard, ...data },
                updated_at: new Date().toISOString(),
              },
            },
          };
        }),

      setWeeklyInsight: (weekStart, insight) =>
        set((s) => {
          const entry = s.weeklyEntries[weekStart] || createEmptyWeeklyEntry(weekStart);
          return {
            weeklyEntries: {
              ...s.weeklyEntries,
              [weekStart]: { ...entry, insight, updated_at: new Date().toISOString() },
            },
          };
        }),

      profile: {
        display_name: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: 'dark',
      },

      updateProfile: (data) =>
        set((s) => ({ profile: { ...s.profile, ...data } })),

      setTheme: (theme) =>
        set((s) => ({ profile: { ...s.profile, theme } })),
    }),
    {
      name: 'inner-game-journal',
      partialize: (s) => ({
        entries: s.entries,
        weeklyEntries: s.weeklyEntries,
        onboarding: s.onboarding,
        profile: s.profile,
      }),
    }
  )
);
