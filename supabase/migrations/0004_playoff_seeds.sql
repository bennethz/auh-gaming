-- Playoff seeds, frozen from the group stage standings when an organizer generates the playoffs.
-- Seeds stay fixed even if group stage results change afterwards. No rows means the playoffs
-- haven't been generated yet.
create table if not exists playoff_seeds (
  seed int primary key check (seed > 0),
  team_id text not null unique references teams (id) on delete cascade
);

alter table playoff_seeds enable row level security;

create policy "Public read" on playoff_seeds for select using (true);
