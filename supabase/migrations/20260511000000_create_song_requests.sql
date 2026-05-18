-- Song request inbox for missing chords requested from the Home page.
-- Run this in Supabase SQL Editor or apply it as a migration.

create extension if not exists pgcrypto;

create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  song_title text not null check (char_length(btrim(song_title)) > 0),
  artist_name text,
  search_query text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'added', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

comment on table public.song_requests is 'User-submitted missing song/chord requests from the AKOR website.';
comment on column public.song_requests.song_title is 'Requested song title.';
comment on column public.song_requests.artist_name is 'Optional artist name supplied by the user.';
comment on column public.song_requests.search_query is 'Search term that produced no result when the request was created.';
comment on column public.song_requests.note is 'Optional note such as capo, tone, version, or extra request details.';
comment on column public.song_requests.status is 'Moderation/workflow status for the request.';

create index if not exists song_requests_created_at_idx on public.song_requests (created_at desc);
create index if not exists song_requests_status_idx on public.song_requests (status);
create index if not exists song_requests_song_title_idx on public.song_requests using gin (to_tsvector('simple', coalesce(song_title, '')));
create index if not exists song_requests_artist_name_idx on public.song_requests using gin (to_tsvector('simple', coalesce(artist_name, '')));

alter table public.song_requests enable row level security;

-- Public visitors can submit requests from the website.
drop policy if exists "Anyone can submit song requests" on public.song_requests;
create policy "Anyone can submit song requests"
  on public.song_requests
  for insert
  to anon, authenticated
  with check (true);

-- Keep requests private from the public API by default. View/manage them in the Supabase dashboard
-- or create an admin-only SELECT/UPDATE policy for your back-office role later.
