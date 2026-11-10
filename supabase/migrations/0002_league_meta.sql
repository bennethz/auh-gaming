-- Single row of league-wide metadata. The organizer save action stamps standings_updated_at,
-- which the homepage shows as the "standings as of" date.
create table if not exists league_meta (
  id boolean primary key default true check (id),
  standings_updated_at timestamptz
);

alter table league_meta enable row level security;

create policy "Public read" on league_meta for select using (true);
