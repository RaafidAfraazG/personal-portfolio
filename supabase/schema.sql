create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  tech_stack text[] not null default '{}',
  code_url text,
  live_url text,
  thumbnail_text text,
  image_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  items text[] not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  duration text,
  bullets text[] not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  location text,
  duration text,
  score text,
  description text,
  logo_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  description text,
  link_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row
  execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row
  execute function public.set_updated_at();

drop trigger if exists experience_set_updated_at on public.experience;
create trigger experience_set_updated_at
  before update on public.experience
  for each row
  execute function public.set_updated_at();

drop trigger if exists education_set_updated_at on public.education;
create trigger education_set_updated_at
  before update on public.education
  for each row
  execute function public.set_updated_at();

drop trigger if exists achievements_set_updated_at on public.achievements;
create trigger achievements_set_updated_at
  before update on public.achievements
  for each row
  execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.achievements enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content
  for select
  using (true);

drop policy if exists "Public can read visible projects" on public.projects;
create policy "Public can read visible projects"
  on public.projects
  for select
  using (is_visible = true);

drop policy if exists "Public can read visible skills" on public.skills;
create policy "Public can read visible skills"
  on public.skills
  for select
  using (is_visible = true);

drop policy if exists "Public can read visible experience" on public.experience;
create policy "Public can read visible experience"
  on public.experience
  for select
  using (is_visible = true);

drop policy if exists "Public can read visible education" on public.education;
create policy "Public can read visible education"
  on public.education
  for select
  using (is_visible = true);

drop policy if exists "Public can read visible achievements" on public.achievements;
create policy "Public can read visible achievements"
  on public.achievements
  for select
  using (is_visible = true);

drop policy if exists "Admin can manage site content" on public.site_content;
create policy "Admin can manage site content"
  on public.site_content
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can manage projects" on public.projects;
create policy "Admin can manage projects"
  on public.projects
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can manage skills" on public.skills;
create policy "Admin can manage skills"
  on public.skills
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can manage experience" on public.experience;
create policy "Admin can manage experience"
  on public.experience
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can manage education" on public.education;
create policy "Admin can manage education"
  on public.education
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can manage achievements" on public.achievements;
create policy "Admin can manage achievements"
  on public.achievements
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

-- ============================================================
-- VISITOR TRACKING TABLES
-- ============================================================

-- visitor_settings: admin-controlled feature flags
create table if not exists public.visitor_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value boolean not null default true,
  updated_at timestamptz default now()
);

-- Seed default settings (safe to re-run)
insert into public.visitor_settings (key, value)
  values
    ('tracking_enabled', true),
    ('notifications_enabled', true),
    ('show_public_counter', true)
  on conflict (key) do nothing;

-- visitors: one row per unique visitor session
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  ip_hash text,
  city text,
  state text,
  country text,
  os text,
  browser text,
  browser_version text,
  device_type text,
  referrer text,
  page text,
  created_at timestamptz default now()
);

-- Prevent double-counting: same visitor_id within the same UTC day
create unique index if not exists visitors_visitor_id_day_idx
  on public.visitors (visitor_id, date_trunc('day', created_at AT TIME ZONE 'UTC'));

-- visitor_count_cache: single row holding both unique visitors and total visits
create table if not exists public.visitor_count_cache (
  id int primary key default 1,
  total_count    bigint not null default 0,  -- kept for backward compat (= unique_visitors)
  unique_visitors bigint not null default 0, -- unique visitors (same as total_count)
  total_visits   bigint not null default 0,  -- every visit, including returning
  updated_at timestamptz default now()
);

-- Seed initial cache row (safe to re-run)
insert into public.visitor_count_cache (id, total_count, unique_visitors, total_visits)
  values (1, 0, 0, 0)
  on conflict (id) do nothing;

-- If this is a migration on an existing database, copy total_count → unique_visitors
-- and seed total_visits at the same value (best approximation of historical data).
update public.visitor_count_cache
  set unique_visitors = total_count,
      total_visits    = total_count
  where id = 1
    and unique_visitors = 0
    and total_count > 0;

-- Trigger function: fires on every new unique visitor INSERT.
-- Increments total_count (legacy), unique_visitors, AND total_visits.
create or replace function public.increment_visitor_count()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.visitor_count_cache
    set total_count     = total_count + 1,
        unique_visitors = unique_visitors + 1,
        total_visits    = total_visits + 1,
        updated_at      = now()
    where id = 1;
  return new;
end;
$$;

drop trigger if exists on_visitor_insert on public.visitors;
create trigger on_visitor_insert
  after insert on public.visitors
  for each row
  execute function public.increment_visitor_count();

-- RPC: increment only total_visits (for returning visitors who are NOT inserted).
-- Uses security definer so the anon role can call it without direct UPDATE access.
create or replace function public.increment_total_visits()
returns void
language plpgsql
security definer
as $$
begin
  update public.visitor_count_cache
    set total_visits = total_visits + 1,
        updated_at   = now()
    where id = 1;
end;
$$;

-- Allow unauthenticated callers to increment total_visits via RPC
grant execute on function public.increment_total_visits() to anon;

-- ============================================================
-- RLS for visitor tracking tables
-- ============================================================

alter table public.visitor_settings enable row level security;
alter table public.visitors enable row level security;
alter table public.visitor_count_cache enable row level security;

-- visitor_settings: public can read; admin can manage
drop policy if exists "Public can read visitor settings" on public.visitor_settings;
create policy "Public can read visitor settings"
  on public.visitor_settings
  for select
  using (true);

drop policy if exists "Admin can manage visitor settings" on public.visitor_settings;
create policy "Admin can manage visitor settings"
  on public.visitor_settings
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com')
  with check (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

-- visitors: anyone can insert (needed for anonymous tracking)
-- Admin only for reads/deletes
drop policy if exists "Anyone can insert visitors" on public.visitors;
create policy "Anyone can insert visitors"
  on public.visitors
  for insert
  with check (true);

drop policy if exists "Admin can read visitors" on public.visitors;
create policy "Admin can read visitors"
  on public.visitors
  for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

drop policy if exists "Admin can delete visitors" on public.visitors;
create policy "Admin can delete visitors"
  on public.visitors
  for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'raafid122@gmail.com');

-- visitor_count_cache: public can read total count
drop policy if exists "Public can read visitor count" on public.visitor_count_cache;
create policy "Public can read visitor count"
  on public.visitor_count_cache
  for select
  using (true);
