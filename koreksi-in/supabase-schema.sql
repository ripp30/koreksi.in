create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  dosen_id uuid not null references public.profiles(id) on delete cascade,
  room_code text not null unique,
  title text not null,
  description text,
  deadline timestamptz,
  status text not null default 'active' check (status in ('active','closed','draft')),
  created_at timestamptz not null default now(),
  question_text text,
  answer_key_text text,
  rubric_rules text
);

create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  criterion text not null,
  description text,
  max_score numeric not null default 0
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  student_name text not null,
  file_path text not null,
  status text not null default 'submitted' check (status in ('submitted','processing','reviewed')),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  student_nim text not null,
  extracted_text text,
  score numeric,
  feedback text,
  rubric_breakdown jsonb,
  ai_risk text check (ai_risk in ('low','medium','high'))
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  submissions_id uuid not null unique references public.submissions(id) on delete cascade,
  scores jsonb,
  suggested_total numeric,
  feedback text,
  similarity_score numeric default 0,
  ai_status text,
  updated_at timestamptz not null default now()
);

create table if not exists public.final_grades (
  id uuid primary key default gen_random_uuid(),
  submissions_id uuid not null unique references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  final_score numeric not null,
  final_feedback text,
  approved_at timestamptz not null default now()
);

create index if not exists rooms_dosen_id_idx on public.rooms(dosen_id);
create index if not exists submissions_room_id_idx on public.submissions(room_id);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.rubrics enable row level security;
alter table public.submissions enable row level security;
alter table public.evaluations enable row level security;
alter table public.final_grades enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (auth.uid() = id);

drop policy if exists rooms_owner_all on public.rooms;
create policy rooms_owner_all on public.rooms for all using (auth.uid() = dosen_id) with check (auth.uid() = dosen_id);

drop policy if exists rubrics_owner_select on public.rubrics;
create policy rubrics_owner_select on public.rubrics for select using (exists(select 1 from public.rooms r where r.id=room_id and r.dosen_id=auth.uid()));

drop policy if exists submissions_owner_select on public.submissions;
create policy submissions_owner_select on public.submissions for select using (exists(select 1 from public.rooms r where r.id=room_id and r.dosen_id=auth.uid()));

drop policy if exists submissions_owner_update on public.submissions;
create policy submissions_owner_update on public.submissions for update using (exists(select 1 from public.rooms r where r.id=room_id and r.dosen_id=auth.uid())) with check (exists(select 1 from public.rooms r where r.id=room_id and r.dosen_id=auth.uid()));

drop policy if exists evaluations_owner_select on public.evaluations;
create policy evaluations_owner_select on public.evaluations for select using (exists(select 1 from public.submissions s join public.rooms r on r.id=s.room_id where s.id=submissions_id and r.dosen_id=auth.uid()));

drop policy if exists final_grades_owner_all on public.final_grades;
create policy final_grades_owner_all on public.final_grades for all using (reviewer_id=auth.uid()) with check (reviewer_id=auth.uid());

insert into storage.buckets (id,name,public) values ('submissions','submissions',false) on conflict (id) do nothing;
