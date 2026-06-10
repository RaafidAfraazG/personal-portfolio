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
