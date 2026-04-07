-- ============================================================
-- Inner Game Journal — Full Schema
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES
-- ============================================================
create table if not exists public.user_profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  display_name        text        not null default '',
  timezone            text        not null default 'UTC',
  theme               text        not null default 'dark' check (theme in ('dark', 'light')),
  identity_gap_text   text        not null default '',
  onboarding_done     boolean     not null default false,
  morning_time        time        default '07:00',
  evening_time        time        default '21:00',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. LIFE ASSESSMENTS
-- ============================================================
create table if not exists public.life_assessments (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.user_profiles(id) on delete cascade,
  body_energy     integer     not null default 0 check (body_energy between 0 and 10),
  mind_dialogue   integer     not null default 0 check (mind_dialogue between 0 and 10),
  intimacy        integer     not null default 0 check (intimacy between 0 and 10),
  family          integer     not null default 0 check (family between 0 and 10),
  circle          integer     not null default 0 check (circle between 0 and 10),
  purpose         integer     not null default 0 check (purpose between 0 and 10),
  experiences     integer     not null default 0 check (experiences between 0 and 10),
  alignment       integer     not null default 0 check (alignment between 0 and 10),
  wealth          integer     not null default 0 check (wealth between 0 and 10),
  growth          integer     not null default 0 check (growth between 0 and 10),
  created_at      timestamptz not null default now()
);

alter table public.life_assessments enable row level security;

create policy "Users manage own assessments"
  on public.life_assessments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. MORNING CHECK-INS
-- ============================================================
create table if not exists public.morning_checkins (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.user_profiles(id) on delete cascade,
  date            date        not null,
  q1_intention    text        not null default '',
  q2_focus        text        not null default '',
  q3_energy       text        not null default '',
  q4_pattern      text        not null default '',
  created_at      timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.morning_checkins enable row level security;

create policy "Users manage own morning checkins"
  on public.morning_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 4. EVENING CHECK-INS
-- ============================================================
create table if not exists public.evening_checkins (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.user_profiles(id) on delete cascade,
  date            date        not null,
  q1_delivered    text        not null default '',
  q2_pattern      text        not null default '',
  q3_gap          text        not null default '',
  q4_learning     text        not null default '',
  created_at      timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.evening_checkins enable row level security;

create policy "Users manage own evening checkins"
  on public.evening_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 5. DAILY SCORECARDS
-- ============================================================
create table if not exists public.daily_scorecards (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.user_profiles(id) on delete cascade,
  date            date        not null,
  awareness       integer     not null default 0 check (awareness between 0 and 5),
  intention       integer     not null default 0 check (intention between 0 and 5),
  state           integer     not null default 0 check (state between 0 and 5),
  presence        integer     not null default 0 check (presence between 0 and 5),
  ownership       integer     not null default 0 check (ownership between 0 and 5),
  total           integer     generated always as (awareness + intention + state + presence + ownership) stored,
  created_at      timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_scorecards enable row level security;

create policy "Users manage own daily scorecards"
  on public.daily_scorecards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 6. DAILY INSIGHTS (AI-generated)
-- ============================================================
create table if not exists public.daily_insights (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.user_profiles(id) on delete cascade,
  date                date        not null,
  insight_text        text        not null default '',
  lowest_dimension    text        not null default '',
  is_saved            boolean     not null default false,
  created_at          timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_insights enable row level security;

create policy "Users manage own daily insights"
  on public.daily_insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 7. WEEKLY RESETS
-- ============================================================
create table if not exists public.weekly_resets (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.user_profiles(id) on delete cascade,
  week_start          date        not null,
  s1_what_happened    text        not null default '',
  s2_patterns         text        not null default '',
  s2_drivers          text        not null default '',
  s3_moved_forward    text        not null default '',
  s3_delayed          text        not null default '',
  s4_energy_best      text        not null default '',
  s5_at_standard      text        not null default '',
  s5_lowered          text        not null default '',
  s7_cost_90          text        not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_resets enable row level security;

create policy "Users manage own weekly resets"
  on public.weekly_resets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger weekly_resets_updated_at
  before update on public.weekly_resets
  for each row execute function public.set_updated_at();

-- ============================================================
-- 8. WEEKLY SCORECARDS
-- ============================================================
create table if not exists public.weekly_scorecards (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.user_profiles(id) on delete cascade,
  week_start      date        not null,
  clarity         integer     not null default 0 check (clarity between 0 and 5),
  ownership       integer     not null default 0 check (ownership between 0 and 5),
  presence        integer     not null default 0 check (presence between 0 and 5),
  standards       integer     not null default 0 check (standards between 0 and 5),
  courage         integer     not null default 0 check (courage between 0 and 5),
  growth          integer     not null default 0 check (growth between 0 and 5),
  total           integer     generated always as (clarity + ownership + presence + standards + courage + growth) stored,
  created_at      timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_scorecards enable row level security;

create policy "Users manage own weekly scorecards"
  on public.weekly_scorecards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 9. WEEKLY REFLECTIONS (AI-generated)
-- ============================================================
create table if not exists public.weekly_reflections (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.user_profiles(id) on delete cascade,
  week_start          date        not null,
  reflection_text     text        not null default '',
  suggested_shift     text        not null default '',
  next_week_focus     text        not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reflections enable row level security;

create policy "Users manage own weekly reflections"
  on public.weekly_reflections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger weekly_reflections_updated_at
  before update on public.weekly_reflections
  for each row execute function public.set_updated_at();

-- ============================================================
-- 10. STREAK TRACKING (computed view)
-- ============================================================
-- Instead of a separate table, we compute streaks from morning_checkins.
-- This view returns the current streak for each user.
create or replace view public.user_streaks as
with dates as (
  select
    user_id,
    date,
    date - (row_number() over (partition by user_id order by date))::integer as grp
  from public.morning_checkins
),
groups as (
  select
    user_id,
    grp,
    count(*) as streak_length,
    max(date) as last_date
  from dates
  group by user_id, grp
)
select
  user_id,
  coalesce(
    (select streak_length from groups g2
     where g2.user_id = g.user_id
       and g2.last_date >= current_date - 1
     order by last_date desc
     limit 1),
    0
  ) as current_streak,
  max(streak_length) as longest_streak,
  sum(streak_length) as total_days
from groups g
group by user_id;

-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index if not exists morning_checkins_user_date   on public.morning_checkins(user_id, date desc);
create index if not exists evening_checkins_user_date   on public.evening_checkins(user_id, date desc);
create index if not exists daily_scorecards_user_date   on public.daily_scorecards(user_id, date desc);
create index if not exists daily_insights_user_date     on public.daily_insights(user_id, date desc);
create index if not exists daily_insights_saved         on public.daily_insights(user_id, is_saved) where is_saved = true;
create index if not exists weekly_resets_user_week      on public.weekly_resets(user_id, week_start desc);
create index if not exists weekly_scorecards_user_week  on public.weekly_scorecards(user_id, week_start desc);
create index if not exists weekly_reflections_user_week on public.weekly_reflections(user_id, week_start desc);
