-- Organizer-set order for breaking ties on group stage points. Lower position ranks higher.
-- Only compares teams level on points; teams with no row rank after listed ones, in team order.
create table if not exists tiebreak_order (
  team_id text primary key references teams (id) on delete cascade,
  position int not null
);

alter table tiebreak_order enable row level security;

create policy "Public read" on tiebreak_order for select using (true);
