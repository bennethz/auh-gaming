-- League data for the current season.
-- Run in the Supabase SQL editor (or `supabase db push`), then run supabase/seed.sql.

create table if not exists teams (
  id text primary key,
  name text not null,
  captain text not null default '',
  sort_order int not null default 0
);

-- One row per team pair. team_a_id sorts before team_b_id; score is from team A's side.
create table if not exists group_results (
  team_a_id text not null references teams (id) on delete cascade,
  team_b_id text not null references teams (id) on delete cascade,
  score text not null check (score in ('2-0', '1-1', '0-2', 'DW', 'DL')),
  primary key (team_a_id, team_b_id),
  check (team_a_id < team_b_id)
);

create table if not exists point_deductions (
  team_id text primary key references teams (id) on delete cascade,
  points int not null check (points > 0)
);

create table if not exists matches (
  id text primary key,
  stage text not null,
  team_a_id text not null references teams (id),
  team_b_id text not null references teams (id),
  score_a int,
  score_b int,
  status text not null check (status in ('played', 'scheduled')),
  starts_at timestamptz not null
);

-- Organizer-entered playoff scores and dates, keyed by bracket match id ("U1", "L3", "GF").
create table if not exists playoff_entries (
  match_id text primary key,
  score_a int,
  score_b int,
  match_date date
);

-- Anyone can read. Writes go through the server with the service role key, which bypasses RLS.
alter table teams enable row level security;
alter table group_results enable row level security;
alter table point_deductions enable row level security;
alter table matches enable row level security;
alter table playoff_entries enable row level security;

create policy "Public read" on teams for select using (true);
create policy "Public read" on group_results for select using (true);
create policy "Public read" on point_deductions for select using (true);
create policy "Public read" on matches for select using (true);
create policy "Public read" on playoff_entries for select using (true);
