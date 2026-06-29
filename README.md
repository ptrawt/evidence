# Evidence — Personal Growth OS

> "Build the strongest version of yourself through evidence, not motivation."

A personal productivity app built around the concept of logging "evidence" of growth across four life pillars. Every action you take becomes proof — not a checkbox.

## Features

**Four Pillars**
- 💻 Career — skill building, learning, coding practice
- 💪 Body — food tracking, weight log, workouts, sleep, IF, mood/energy
- 🧠 Mind — knowledge sessions, reading, meditation
- 💰 Money — expense tracking, savings, impulse resistance

**Core systems**
- Daily Habits checklist (quests that repeat every day → XP)
- Weekly Planner (scheduled tasks & workouts with sets/reps/kg)
- Evidence log + XP system + Timeline
- Body Hub: calorie budget, weight goal progress, daily vitals
- Quest Management — add/remove daily habits per pillar
- Knowledge Tracker — topic, type, time spent → XP
- Money Tracker — expenses, savings, impulse resisted
- Progress Photos — upload every 2 weeks, before/after compare
- PWA — installable on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| UI | MUI v9 (dark theme, amber accent) |
| State | Redux Toolkit (optimistic updates) |
| Routing | React Router v7 |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| PWA | vite-plugin-pwa — installable, app shell cached |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

> Use only the **anon/public** key — never the service role secret key.

### 3. Supabase — create tables

Run the following in Supabase SQL Editor:

```sql
-- Evidence entries
create table public.evidence_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  pillar text not null,
  category text not null,
  xp integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.evidence_entries enable row level security;
create policy "Users manage own evidence" on public.evidence_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Food entries
create table public.food_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  meal text not null,
  name text not null,
  kcal integer not null default 0,
  protein integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.food_entries enable row level security;
create policy "Users manage own food" on public.food_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weight entries
create table public.weight_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  weight numeric not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);
alter table public.weight_entries enable row level security;
create policy "Users manage own weight" on public.weight_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Body settings
create table public.body_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calorie_target integer not null default 2000,
  protein_target integer not null default 150,
  strict_mode boolean not null default false,
  weight_goal numeric
);
alter table public.body_settings enable row level security;
create policy "Users manage own body settings" on public.body_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Body daily (water, sleep, IF, mood, energy)
create table public.body_daily (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  water_ml integer not null default 0,
  sleep_hours numeric not null default 0,
  if_start text not null default '',
  if_end text not null default '',
  if_done boolean not null default false,
  mood integer not null default 0,
  energy integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);
alter table public.body_daily enable row level security;
create policy "Users manage own body daily" on public.body_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quests
create table public.quests (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  pillar text not null,
  name text not null,
  xp integer not null default 10,
  is_preset boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.quests enable row level security;
create policy "Users manage own quests" on public.quests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily completions
create table public.daily_completions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  quest_id text references public.quests(id) on delete cascade not null,
  date text not null,
  created_at timestamptz not null default now()
);
alter table public.daily_completions enable row level security;
create policy "Users manage own completions" on public.daily_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Money entries
create table public.money_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  type text not null,
  amount numeric not null default 0,
  category text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.money_entries enable row level security;
create policy "Users manage own money" on public.money_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Knowledge entries
create table public.knowledge_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  pillar text not null,
  topic text not null,
  type text not null,
  minutes integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);
alter table public.knowledge_entries enable row level security;
create policy "Users manage own knowledge" on public.knowledge_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Plan items (planner)
create table public.plan_items (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  pillar text not null,
  title text not null,
  type text not null default 'task',
  completed boolean not null default false,
  notes text not null default '',
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.plan_items enable row level security;
create policy "Users manage own plan items" on public.plan_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Progress photos
create table public.progress_photos (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  taken_at text not null,
  storage_path text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.progress_photos enable row level security;
create policy "Users manage own photos" on public.progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Also add the **push subscriptions** table:

```sql
CREATE TABLE push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  reminder_hour smallint NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

Also create a **Storage bucket** named `progress-photos` (private) with policy:
```sql
create policy "Users manage own photos storage" on storage.objects
  for all using (auth.uid()::text = (storage.foldername(name))[1])
  with check (auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Push notifications (optional)

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

Add public key to `.env.local` (`VITE_VAPID_PUBLIC_KEY`), then set Supabase secrets:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase secrets set \
  --project-ref <ref> \
  VAPID_PUBLIC_KEY=<public> \
  VAPID_PRIVATE_KEY=<private> \
  VAPID_SUBJECT=mailto:<email>
```

Deploy the edge function:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy send-daily-push --project-ref <ref>
```

Schedule hourly cron in Supabase SQL Editor (enable `pg_cron` + `pg_net` extensions first):
```sql
SELECT cron.schedule('daily-push', '0 * * * *', $$
  SELECT net.http_post(
    url := 'https://<ref>.supabase.co/functions/v1/send-daily-push',
    headers := '{"Authorization": "Bearer <service_role_key>", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
$$);
```

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`

## Architecture

```
Redux (optimistic UI state)
    ↕ on mutation: update immediately, then sync
Supabase (persistent storage)
    ↕ on login: load all data into Redux via useDataSync()
```

RLS is enabled on all tables — users can only access their own data.
