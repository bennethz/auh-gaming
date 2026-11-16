-- Copies each team's existing captain (teams.captain) into players as a Captain-class player.
-- Run once after 0005_players.sql. Safe to re-run: skips teams that already have any players,
-- and teams with no captain name.
insert into players (id, team_id, name, class, position)
select t.id || '-captain', t.id, trim(t.captain), 'Captain', 0
from teams t
where trim(t.captain) <> ''
  and not exists (select 1 from players p where p.team_id = t.id)
on conflict (id) do nothing;
