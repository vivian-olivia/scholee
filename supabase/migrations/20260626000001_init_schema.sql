-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  avatar_url text,
  study_level text check (study_level in ('highschool', 's1', 's2', 's3', 'gap')),
  university text,
  field text,
  gpa numeric(3,2),
  bio text,
  created_at timestamptz default now()
);

-- Scholarships
create table public.scholarships (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  provider_name text not null,
  provider_logo_url text,
  amount text,
  living_allowance text,
  funding_type text check (funding_type in ('full', 'partial')),
  levels text[] not null,
  countries text[] not null,
  deadline date not null,
  duration text,
  requirements text[],
  description text,
  apply_url text not null,
  is_featured boolean default false,
  status text check (status in ('active', 'closed', 'draft')) default 'active',
  created_at timestamptz default now()
);

-- Saved scholarships
create table public.saved_scholarships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  scholarship_id uuid references public.scholarships(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(user_id, scholarship_id)
);

-- Organisation experiences
create table public.organisations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  role text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Interest tags
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  label text not null,
  created_at timestamptz default now()
);

-- RLS: Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Public profiles are viewable" on public.profiles for select using (true);

-- RLS: Scholarships
alter table public.scholarships enable row level security;
create policy "Anyone can view active scholarships" on public.scholarships for select using (status = 'active');

-- RLS: Saved scholarships
alter table public.saved_scholarships enable row level security;
create policy "Users manage own saves" on public.saved_scholarships using (auth.uid() = user_id);

-- RLS: Organisations
alter table public.organisations enable row level security;
create policy "Users manage own orgs" on public.organisations using (auth.uid() = user_id);
create policy "Public orgs are viewable" on public.organisations for select using (true);

-- RLS: Tags
alter table public.tags enable row level security;
create policy "Users manage own tags" on public.tags using (auth.uid() = user_id);
create policy "Public tags are viewable" on public.tags for select using (true);
