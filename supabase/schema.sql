-- =====================================================
-- NeuroSupport — Complete Database Schema
-- Run this in your Supabase project → SQL Editor
-- =====================================================
--
-- Tables marked [ACTIVE]      → used by the running app
-- Tables marked [PLACEHOLDER] → exist for database design demo only
--                               (data lives in React state / hardcoded JS)
--
-- If you need to re-run this on an existing database, uncomment the
-- teardown block below first to drop everything cleanly.
-- =====================================================

-- =====================================================
-- OPTIONAL TEARDOWN (uncomment if re-running on existing DB)
-- =====================================================
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop table if exists feedback_notes cascade;
-- drop table if exists coaching_messages cascade;
-- drop table if exists progress_reports cascade;
-- drop table if exists behavior_events cascade;
-- drop table if exists scenarios cascade;
-- drop table if exists caregiver_profiles cascade;
-- drop table if exists sessions cascade;
-- drop table if exists learners cascade;


-- =====================================================
-- [ACTIVE] Table 1: learners
-- Learner profiles created and owned by each caregiver/therapist.
-- This is the primary table used by the application.
-- =====================================================
create table if not exists learners (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        references auth.users(id) on delete cascade not null,
  name               text        not null,
  age                int         check (age >= 1 and age <= 100),
  difficulty         text        check (difficulty in ('Beginner','Intermediate','Advanced'))
                                 default 'Beginner',
  noise_sensitivity  int         check (noise_sensitivity between 1 and 5) default 3,
  crowd_sensitivity  int         check (crowd_sensitivity between 1 and 5) default 3,
  pacing             text        check (pacing in ('Slow','Normal')) default 'Normal',
  goals              text,
  avatar_color       text,
  notes              text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);


-- =====================================================
-- [ACTIVE] Table 2: sessions
-- Completed practice session summaries.
-- Saved at the end of each practice session.
-- Real-time events are NOT stored here (they live in React state).
-- =====================================================
create table if not exists sessions (
  id                 uuid        primary key default gen_random_uuid(),
  learner_id         uuid        references learners(id) on delete cascade not null,
  scenario_id        text        not null,
  scenario_title     text        not null,
  dominant_state     text        check (dominant_state in ('calm','confused','stressed')),
  stress_moments     int         default 0,
  confusion_moments  int         default 0,
  hints_given        int         default 0,
  steps_completed    int         default 0,
  total_steps        int         default 0,
  config             jsonb,
  recommendation     text,
  completed_at       timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 3: caregiver_profiles
-- Extended profile for caregivers/therapists beyond Supabase auth.users.
-- In prototype: only email + password is used via Supabase Auth.
-- A row is auto-created for every new user (see trigger below).
-- =====================================================
create table if not exists caregiver_profiles (
  id           uuid  primary key references auth.users(id) on delete cascade,
  full_name    text,
  organization text,
  role         text  check (role in ('caregiver','therapist','teacher','parent'))
                     default 'caregiver',
  phone        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 4: scenarios
-- Custom / therapist-built scenario definitions.
-- In prototype: all scenarios are hardcoded in src/data/scenarios.js.
-- In full system: therapists would build and save scenarios here.
-- =====================================================
create table if not exists scenarios (
  id               uuid     primary key default gen_random_uuid(),
  created_by       uuid     references auth.users(id) on delete set null,
  title            text     not null,
  description      text,
  category         text,
  difficulty       text     check (difficulty in ('Easy','Medium','Hard')),
  duration_minutes int,
  is_system        boolean  default false,   -- true = built-in system scenario
  steps            jsonb,                    -- array of step instruction strings
  objectives       jsonb,                    -- array of learning objectives
  config_options   jsonb,                    -- allowed session configuration options
  created_at       timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 5: behavior_events
-- Real-time emotion and behaviour events captured during a session.
-- In prototype: these live in React state only and are discarded
--               after the session summary is shown.
-- In full system: every detection event would be inserted here.
-- =====================================================
create table if not exists behavior_events (
  id                uuid     primary key default gen_random_uuid(),
  session_id        uuid     references sessions(id)  on delete cascade not null,
  learner_id        uuid     references learners(id)  on delete cascade not null,
  detected_state    text     check (detected_state in ('calm','confused','stressed')),
  detected_expression text,
  confidence_score  numeric(5,2) check (confidence_score >= 0 and confidence_score <= 100),
  scenario_step     int,
  recorded_at       timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 6: coaching_messages
-- Adaptive coaching messages delivered to the learner.
-- In prototype: generated inline by rule-based logic in React.
-- In full system: every message and its trigger would be stored here.
-- =====================================================
create table if not exists coaching_messages (
  id             uuid  primary key default gen_random_uuid(),
  session_id     uuid  references sessions(id)  on delete cascade not null,
  learner_id     uuid  references learners(id)  on delete cascade not null,
  trigger_state  text  check (trigger_state in ('calm','confused','stressed')),
  message        text  not null,
  action_taken   text,   -- e.g. "slowed pacing", "increased guidance"
  step_number    int,
  delivered_at   timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 7: progress_reports
-- Aggregated progress analytics generated over a time period.
-- In prototype: end-of-session summary is shown from React state only.
-- In full system: reports would be generated and stored here.
-- =====================================================
create table if not exists progress_reports (
  id                   uuid     primary key default gen_random_uuid(),
  learner_id           uuid     references learners(id) on delete cascade not null,
  report_period_start  date,
  report_period_end    date,
  total_sessions       int      default 0,
  avg_calm_percentage  numeric(5,2),
  avg_stress_moments   numeric(5,2),
  improvement_trend    text     check (improvement_trend in ('improving','stable','declining')),
  summary              text,
  generated_at         timestamptz default now()
);


-- =====================================================
-- [PLACEHOLDER] Table 8: feedback_notes
-- Therapist/caregiver written notes about learner sessions.
-- In prototype: not implemented.
-- In full system: notes would be written after each session review.
-- =====================================================
create table if not exists feedback_notes (
  id           uuid     primary key default gen_random_uuid(),
  learner_id   uuid     references learners(id)  on delete cascade not null,
  session_id   uuid     references sessions(id)  on delete set null,
  authored_by  uuid     references auth.users(id) on delete set null,
  content      text     not null,
  is_private   boolean  default true,
  created_at   timestamptz default now()
);


-- =====================================================
-- INDEXES
-- Performance indexes on foreign keys and common filter columns
-- =====================================================
create index if not exists idx_learners_user_id
  on learners(user_id);

create index if not exists idx_sessions_learner_id
  on sessions(learner_id);

create index if not exists idx_sessions_completed_at
  on sessions(completed_at desc);

create index if not exists idx_behavior_events_session_id
  on behavior_events(session_id);

create index if not exists idx_behavior_events_recorded_at
  on behavior_events(recorded_at desc);

create index if not exists idx_coaching_messages_session_id
  on coaching_messages(session_id);

create index if not exists idx_progress_reports_learner_id
  on progress_reports(learner_id);

create index if not exists idx_feedback_notes_learner_id
  on feedback_notes(learner_id);


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- All tables are private by default — users only access their own data.
-- =====================================================
alter table learners           enable row level security;
alter table sessions           enable row level security;
alter table caregiver_profiles enable row level security;
alter table scenarios          enable row level security;
alter table behavior_events    enable row level security;
alter table coaching_messages  enable row level security;
alter table progress_reports   enable row level security;
alter table feedback_notes     enable row level security;


-- ----- learners -----
create policy "users can manage their own learners"
  on learners for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----- sessions -----
-- A session belongs to the user who owns the linked learner.
create policy "users can manage their own sessions"
  on sessions for all
  using (
    exists (
      select 1 from learners l
      where l.id = sessions.learner_id
        and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from learners l
      where l.id = sessions.learner_id
        and l.user_id = auth.uid()
    )
  );


-- ----- caregiver_profiles -----
create policy "users can manage their own caregiver profile"
  on caregiver_profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);


-- ----- scenarios -----
-- Any authenticated user may read scenarios.
-- Only the creator may insert / update / delete.
create policy "authenticated users can read scenarios"
  on scenarios for select
  to authenticated
  using (true);

create policy "users can insert their own scenarios"
  on scenarios for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "users can update their own scenarios"
  on scenarios for update
  to authenticated
  using  (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "users can delete their own scenarios"
  on scenarios for delete
  to authenticated
  using (auth.uid() = created_by);


-- ----- behavior_events -----
create policy "users can manage their own behavior events"
  on behavior_events for all
  using (
    exists (
      select 1 from learners l
      where l.id = behavior_events.learner_id
        and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from learners l
      where l.id = behavior_events.learner_id
        and l.user_id = auth.uid()
    )
  );


-- ----- coaching_messages -----
create policy "users can manage their own coaching messages"
  on coaching_messages for all
  using (
    exists (
      select 1 from learners l
      where l.id = coaching_messages.learner_id
        and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from learners l
      where l.id = coaching_messages.learner_id
        and l.user_id = auth.uid()
    )
  );


-- ----- progress_reports -----
create policy "users can manage their own progress reports"
  on progress_reports for all
  using (
    exists (
      select 1 from learners l
      where l.id = progress_reports.learner_id
        and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from learners l
      where l.id = progress_reports.learner_id
        and l.user_id = auth.uid()
    )
  );


-- ----- feedback_notes -----
-- Author OR the owner of the linked learner can access notes.
create policy "users can manage their own feedback notes"
  on feedback_notes for all
  using (
    auth.uid() = authored_by
    or exists (
      select 1 from learners l
      where l.id = feedback_notes.learner_id
        and l.user_id = auth.uid()
    )
  )
  with check (auth.uid() = authored_by);


-- =====================================================
-- GRANTS
-- RLS controls which rows are visible; grants control table-level access.
-- Without these, authenticated users get "permission denied" even with RLS policies.
-- =====================================================
grant select, insert, update, delete on public.learners           to authenticated;
grant select, insert, update, delete on public.sessions           to authenticated;
grant select, insert, update, delete on public.caregiver_profiles to authenticated;
grant select, insert, update, delete on public.scenarios          to authenticated;
grant select, insert, update, delete on public.behavior_events    to authenticated;
grant select, insert, update, delete on public.coaching_messages  to authenticated;
grant select, insert, update, delete on public.progress_reports   to authenticated;
grant select, insert, update, delete on public.feedback_notes     to authenticated;


-- =====================================================
-- TRIGGER: auto-create caregiver_profile row on signup
-- Runs after every new row in auth.users (i.e. every new signup).
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.caregiver_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
