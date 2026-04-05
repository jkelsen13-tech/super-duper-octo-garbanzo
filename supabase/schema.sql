-- ══════════════════════════════════════════════════════════════
-- Threshold — Tolerance Tracker  ·  Supabase Schema
-- Run this in Supabase SQL Editor (Settings → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled on most Supabase projects)
create extension if not exists "pgcrypto";

-- ── Profiles ──────────────────────────────────────────────────
-- One row per authenticated user; extends auth.users automatically
-- via a trigger below.
create table if not exists public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  username        text unique not null,
  avatar_color    text not null default '#d8ede8',
  bio             text,
  price_per_gram  numeric not null default 10,
  baseline_grams  numeric not null default 1.0,  -- grams/day before using this app
  target_days     integer[] not null default '{1,3,5}', -- day-of-week indices (0=Mon)
  created_at      timestamptz not null default now()
);

-- Public read, owner write
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Sessions ──────────────────────────────────────────────────
-- Every use the user logs.
create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles on delete cascade,
  method        text not null check (method in ('flower','pre-roll','dab','concentrate','vape','edible','capsule')),
  amount        numeric,          -- grams (null for edibles/capsules)
  size_category text check (size_category in ('small','medium','large','massive')),
  feel          integer check (feel between 1 and 5),  -- 1=barely … 5=extremely
  notes         text,
  logged_at     timestamptz not null default now()
);

create index on public.sessions (user_id, logged_at desc);

alter table public.sessions enable row level security;
create policy "Users can view their own sessions"
  on public.sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users can delete their own sessions"
  on public.sessions for delete using (auth.uid() = user_id);


-- ── T-Break ───────────────────────────────────────────────────
-- At most one active break per user at a time.
create table if not exists public.tbreaks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,  -- null = currently active
  goal_days  integer not null default 7
);

create index on public.tbreaks (user_id, started_at desc);

alter table public.tbreaks enable row level security;
create policy "Users manage their own t-breaks"
  on public.tbreaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── Posts ─────────────────────────────────────────────────────
-- Social feed entries. A post can optionally reference a session
-- (to share a ring/technique) but doesn't have to.
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles on delete cascade,
  content     text not null,
  session_id  uuid references public.sessions on delete set null,
  created_at  timestamptz not null default now()
);

create index on public.posts (created_at desc);

alter table public.posts enable row level security;
create policy "Posts are publicly viewable"
  on public.posts for select using (true);
create policy "Users can create posts"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);


-- ── Post Likes ────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id uuid references public.posts on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;
create policy "Likes are publicly viewable"
  on public.post_likes for select using (true);
create policy "Users can like/unlike"
  on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── Post Comments ─────────────────────────────────────────────
create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index on public.post_comments (post_id, created_at asc);

alter table public.post_comments enable row level security;
create policy "Comments are publicly viewable"
  on public.post_comments for select using (true);
create policy "Users can write comments"
  on public.post_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments"
  on public.post_comments for delete using (auth.uid() = user_id);


-- ── Follows ───────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id  uuid references public.profiles on delete cascade,
  following_id uuid references public.profiles on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "Follows are publicly viewable"
  on public.follows for select using (true);
create policy "Users manage their own follows"
  on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);


-- ── Push Subscriptions ────────────────────────────────────────
-- Stores Web Push endpoint + keys so the server can send notifications.
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  endpoint     text not null,
  p256dh_key   text not null,
  auth_key     text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;
create policy "Users manage their own push subscriptions"
  on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── Handy View: feed with like counts ────────────────────────
create or replace view public.feed_posts as
select
  p.id,
  p.content,
  p.created_at,
  p.session_id,
  pr.id        as author_id,
  pr.username  as author_username,
  pr.avatar_color,
  (select count(*) from public.post_likes pl where pl.post_id = p.id) as like_count,
  (select count(*) from public.post_comments pc where pc.post_id = p.id) as comment_count
from public.posts p
join public.profiles pr on pr.id = p.user_id
order by p.created_at desc;
