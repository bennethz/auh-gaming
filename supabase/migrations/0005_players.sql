-- Team rosters. Each player belongs to one team and has a class: Captain, S, A, B or C.
-- teams.captain is kept in sync with the Captain-class player by the organizer save action.
create table if not exists players (
  id text primary key,
  team_id text not null references teams (id) on delete cascade,
  name text not null,
  class text not null check (class in ('Captain', 'S', 'A', 'B', 'C')),
  position int not null default 0
);

-- At most one captain per team.
create unique index if not exists players_one_captain_per_team on players (team_id) where class = 'Captain';

alter table players enable row level security;

create policy "Public read" on players for select using (true);
