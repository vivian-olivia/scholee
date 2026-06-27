# Scholee — Claude Code Project Brief

This file is the source of truth for Claude Code. Read this fully before writing any code.

---

## What are we building?

Scholee is an academic scholarship discovery platform for students — high school through doctoral level. Think LinkedIn, but built for academia. The MVP focuses on one core loop:

> Student signs up → sees matched scholarships → saves them → never misses a deadline

**Geography:** Indonesia first
**Primary user:** Students (S1 focus for MVP)
**Secondary users:** Scholarship providers, universities (Phase 2)

---

## Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, TypeScript |
| Styling | Tailwind CSS | Utility-first, no extra UI lib |
| Database | Supabase (Postgres) | Already set up |
| Auth | Supabase Auth | Google OAuth + email |
| Storage | Supabase Storage | For document + avatar uploads |
| Deployment | Vercel | Auto-deploy from GitHub |
| Email | Resend | Deadline reminders (Phase 2) |
| Icons | Tabler Icons (react-icons) | Outline style only |
| Font | Plus Jakarta Sans | Via next/font + Google Fonts |

---

## Color tokens

Always use these exact values. Never use arbitrary colors.

```css
/* Primary — Indigo */
--primary-dark: #2D2A8E;
--primary: #4B47C4;
--primary-light: #7B78E8;
--primary-tint: #C4C3F7;
--primary-surface: #EEEDFB;

/* Accent — Teal */
--accent: #0F9B8E;
--accent-surface: #E1F7F5;

/* Semantic */
--urgent: #E84040;
--urgent-surface: #FDEAEA;
--warning: #F5A623;
--warning-surface: #FEF4E0;
--success: #1A9E5C;
--success-surface: #E1F5EE;

/* Neutrals */
--text-primary: #1A1A2E;
--text-secondary: #4A4A6A;
--text-muted: #8A8AAA;
--border: #E2E2EF;
--border-strong: #C4C4DF;
--surface-0: #FFF8F0;
--surface-1: #F5F4FF;
--surface-2: #FFFFFF;
```

---

## Typography

Font: Plus Jakarta Sans
Scale: 10px caption / 12px body-sm / 14px body-md / 17px title-sm / 20px title-md / 24px title-lg
Weights: 400 regular / 500 medium / 600 semibold

---

## Folder structure

Follow this exactly:

```
scholee/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (student)/
│   │   ├── explore/page.tsx
│   │   ├── saved/page.tsx
│   │   ├── profile/page.tsx
│   │   └── scholarship/[id]/page.tsx
│   ├── (admin)/
│   │   └── cms/page.tsx
│   ├── layout.tsx
│   └── page.tsx               ← landing page
├── components/
│   ├── ui/                    ← atoms: Button, Tag, Input, Avatar, etc.
│   ├── scholarship/           ← ScholarshipCard, ScholarshipDetail, etc.
│   ├── profile/               ← ProfileHeader, OrgItem, DocItem, etc.
│   ├── layout/                ← BottomNav, TopBar, etc.
│   └── admin/                 ← CmsTable, CmsForm, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts          ← browser client
│   │   └── server.ts          ← server client
│   ├── utils.ts               ← helpers (deadline urgency, date format, etc.)
│   └── types.ts               ← all TypeScript types
├── hooks/
│   ├── useScholarships.ts
│   ├── useSaved.ts
│   └── useProfile.ts
├── public/
│   └── icons/
├── styles/
│   └── globals.css            ← CSS variables + Tailwind base
├── .env.local                 ← Supabase keys (never commit)
└── CLAUDE.md                  ← this file
```

---

## Database schema (Supabase)

Run these SQL statements in the Supabase SQL editor in this order:

```sql
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
```

### Row Level Security (RLS)

Enable RLS on all tables and add these policies:

```sql
-- Profiles: users can only read/write their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Public profiles are viewable" on public.profiles for select using (true);

-- Scholarships: anyone can read, only admin can write
alter table public.scholarships enable row level security;
create policy "Anyone can view active scholarships" on public.scholarships for select using (status = 'active');

-- Saved: users manage their own saves
alter table public.saved_scholarships enable row level security;
create policy "Users manage own saves" on public.saved_scholarships using (auth.uid() = user_id);

-- Organisations: users manage their own
alter table public.organisations enable row level security;
create policy "Users manage own orgs" on public.organisations using (auth.uid() = user_id);
create policy "Public orgs are viewable" on public.organisations for select using (true);

-- Tags: users manage their own
alter table public.tags enable row level security;
create policy "Users manage own tags" on public.tags using (auth.uid() = user_id);
create policy "Public tags are viewable" on public.tags for select using (true);
```

---

## TypeScript types

Keep all types in `lib/types.ts`:

```typescript
export type StudyLevel = 'highschool' | 's1' | 's2' | 's3' | 'gap'
export type FundingType = 'full' | 'partial'
export type ScholarshipStatus = 'active' | 'closed' | 'draft'

export interface Profile {
  id: string
  name: string
  avatar_url?: string
  study_level: StudyLevel
  university?: string
  field?: string
  gpa?: number
  bio?: string
  created_at: string
}

export interface Scholarship {
  id: string
  title: string
  provider_name: string
  provider_logo_url?: string
  amount?: string
  living_allowance?: string
  funding_type: FundingType
  levels: string[]
  countries: string[]
  deadline: string
  duration?: string
  requirements?: string[]
  description?: string
  apply_url: string
  is_featured: boolean
  status: ScholarshipStatus
  created_at: string
}

export interface SavedScholarship {
  id: string
  user_id: string
  scholarship_id: string
  saved_at: string
  scholarship?: Scholarship
}

export interface Organisation {
  id: string
  user_id: string
  name: string
  role: string
  start_date?: string
  end_date?: string
  is_current: boolean
}

export interface Tag {
  id: string
  user_id: string
  label: string
}
```

---

## Key utility functions

Add these to `lib/utils.ts`:

```typescript
// Deadline urgency level
export function getDeadlineUrgency(deadline: string): 'urgent' | 'soon' | 'ok' | 'expired' {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 7) return 'urgent'
  if (days <= 30) return 'soon'
  return 'ok'
}

// Progress bar fill % (60-day window)
export function getDeadlineProgress(deadline: string): number {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  return Math.min(100, Math.max(0, ((60 - days) / 60) * 100))
}

// Days remaining label
export function getDaysLabel(deadline: string): string {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day left'
  if (days <= 30) return `${days} days left`
  return new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Profile completion score
export function getProfileCompletion(profile: Profile, orgs: Organisation[], tags: Tag[]): {
  score: number
  hint: string
} {
  let score = 20 // base for signing up
  if (profile.avatar_url) score += 10
  if (profile.bio) score += 15
  if (profile.university) score += 10
  if (profile.field) score += 10
  if (profile.gpa) score += 15
  if (orgs.length > 0) score += 10
  if (tags.length > 0) score += 10

  const hints: Record<number, string> = {
    20: 'Add a profile photo to stand out',
    30: 'Add your university to get campus scholarships',
    40: 'Add your field of study for better matches',
    50: 'Add your GPA to unlock more scholarships',
    55: 'Add your GPA to unlock more scholarships',
    65: 'Add an organisation experience to strengthen your profile',
    75: 'Add interest tags to personalise your matches',
    85: 'Add a bio to complete your profile',
    100: 'Your profile is complete!'
  }

  const closestKey = Object.keys(hints)
    .map(Number)
    .filter(k => k >= score)
    .sort((a, b) => a - b)[0] ?? 100

  return { score, hint: hints[closestKey] }
}
```

---

## Build order (follow this strictly)

Build in this exact order. Do not skip ahead.

### Step 1 — Project setup
- [x] `npx create-next-app@latest scholee --typescript --tailwind --app`
- [x] Install dependencies: `@supabase/supabase-js @supabase/ssr react-icons`
- [x] Set up `globals.css` with CSS variables
- [x] Set up `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [x] Set up `.env.local` with Supabase URL and anon key
- [x] Set up `lib/types.ts`
- [x] Set up `lib/utils.ts`

### Step 2 — Database
- [x] Run SQL schema in Supabase SQL editor
- [x] Enable RLS + add policies
- [ ] Enable Google OAuth in Supabase Auth settings
- [ ] Test connection from Next.js

### Step 3 — Auth screens
- [ ] Landing page (`app/page.tsx`)
- [ ] Sign up flow (`app/(auth)/signup/`)
- [ ] Log in page (`app/(auth)/login/`)
- [ ] Google OAuth callback handler
- [ ] Onboarding flow (3 steps, saves to `profiles` table)
- [ ] Auth middleware (`middleware.ts`) — protect student routes

### Step 4 — Scholarship listing (core MVP)
- [ ] `ScholarshipCard` component
- [ ] `Tag` component
- [ ] Fetch scholarships from Supabase
- [ ] Filter by level, funding type, country
- [ ] Search by keyword
- [ ] Featured card variant
- [ ] Explore page (`app/(student)/explore/page.tsx`)

### Step 5 — Scholarship detail
- [ ] Detail page (`app/(student)/scholarship/[id]/page.tsx`)
- [ ] Info grid component
- [ ] Requirements list
- [ ] Save / unsave button (writes to `saved_scholarships`)
- [ ] Apply now button (external link)

### Step 6 — Saved scholarships
- [ ] Fetch saved scholarships with deadline urgency
- [ ] Sort by deadline soonest
- [ ] Urgency left border + progress bar
- [ ] Empty state
- [ ] Saved page (`app/(student)/saved/page.tsx`)

### Step 7 — Student profile
- [ ] Profile page (`app/(student)/profile/page.tsx`)
- [ ] Own view vs public view (`app/(student)/profile/[id]/page.tsx`)
- [ ] Profile completion bar + hint
- [ ] Organisation list + add form
- [ ] Interest tags
- [ ] Edit profile form

### Step 8 — Bottom nav
- [ ] `BottomNav` component with 3 tabs
- [ ] Active state per route
- [ ] Add to student layout (`app/(student)/layout.tsx`)

### Step 9 — Admin CMS
- [ ] Protect `/admin` route (check admin email in session)
- [ ] Scholarship table with edit / delete
- [ ] Add / edit scholarship form
- [ ] Stats row (total, active, closing soon, expired)

### Step 10 — Polish + deploy
- [ ] Loading states on all data fetches
- [ ] Error states + empty states
- [ ] Mobile responsiveness check
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Smoke test all flows end to end

---

## Coding rules

1. **TypeScript everywhere.** No `any`. Use types from `lib/types.ts`.
2. **Server components by default.** Only add `'use client'` when you need interactivity or browser APIs.
3. **Supabase server client for data fetching** in server components. Browser client only for mutations in client components.
4. **No inline styles.** Use Tailwind classes only. Map color tokens to Tailwind config.
5. **No external UI libraries** (no shadcn, no MUI, no Chakra). Build components from scratch using Tailwind.
6. **Mobile-first.** Design for 390px width first. Desktop is secondary for all student screens.
7. **Admin is desktop-only.** No need to make CMS mobile-friendly.
8. **Always handle loading and error states.** Never leave a blank screen while fetching.
9. **Keep components small.** If a component is over 150 lines, split it.
10. **Comment non-obvious logic.** Especially the deadline urgency and progress bar calculations.

---

## Environment variables needed

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get both from: Supabase dashboard → Project Settings → API

---

## Accounts to set up before starting (if not done yet)

- [ ] GitHub — create repo `scholee`
- [ ] Supabase — create new project, save URL + anon key
- [ ] Vercel — connect to GitHub repo
- [ ] Google Cloud Console — create OAuth credentials for Google sign-in

### Google OAuth setup steps
1. Go to console.cloud.google.com
2. Create new project → "Scholee"
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase: Authentication → Providers → Google → paste credentials

---

## Reference: all MVP screens

| Screen | Route | Component |
|---|---|---|
| Landing | `/` | `app/page.tsx` |
| Sign up | `/signup` | `app/(auth)/signup/page.tsx` |
| Log in | `/login` | `app/(auth)/login/page.tsx` |
| Explore | `/explore` | `app/(student)/explore/page.tsx` |
| Scholarship detail | `/scholarship/[id]` | `app/(student)/scholarship/[id]/page.tsx` |
| Saved | `/saved` | `app/(student)/saved/page.tsx` |
| Own profile | `/profile` | `app/(student)/profile/page.tsx` |
| Public profile | `/profile/[id]` | `app/(student)/profile/[id]/page.tsx` |
| Admin CMS | `/admin/cms` | `app/(admin)/cms/page.tsx` |
