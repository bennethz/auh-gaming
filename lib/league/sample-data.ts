/**
 * Static sample data for the first version of the site.
 * Replace with real data sources (database, Discord API) when the backend exists.
 * Values in square brackets are content the community still needs to provide.
 */
import { buildGroupRecords, toGroupResultMap } from "./group-stage";
import type { GroupRecord, GroupResult, Match, PlayoffFormat, SeriesScore, Team } from "./types";

/** Top 8 go to the upper bracket, 9th to 16th to the lower bracket. */
const PLAYOFF_FORMAT: PlayoffFormat = "8-upper-8-lower";

export const SEASON = {
  number: 15,
  leagueName: "Civil War",
  game: "Dota 2",
  teamCount: 16,
  playoffFormat: PLAYOFF_FORMAT,
} as const;

export const DISCORD_INVITE_URL = "https://discord.com";

export const COMMUNITY = {
  tagline: "Esports Team and Gaming Community in the MENA Region",
  /** Static value for now. TODO: Read from the Discord API (guild widget / approximate_presence_count). */
  playersOnline: 128,
} as const;

const TEAM_CODENAMES = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliet",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
] as const;

export const TEAMS: Team[] = TEAM_CODENAMES.map((codename) => ({
  id: codename.toLowerCase(),
  name: `Team ${codename}`,
  captain: "[Captain name]",
}));

/** Rounds of the round robin with sample results. Each team plays one series per round. */
const SAMPLE_ROUNDS_PLAYED = 7;

/** Deterministic sample score: lower-listed teams are stronger, with some draws and upsets. */
function getSampleScore(indexA: number, indexB: number): SeriesScore {
  if ((indexA + indexB) % 4 === 0) return "1-1";
  const isUpset = (indexA * 3 + indexB) % 5 === 0;
  return indexA < indexB !== isUpset ? "2-0" : "0-2";
}

/**
 * Builds sample results for the first rounds of a round robin (circle method),
 * so every team has played the same number of series.
 */
function buildSampleGroupResults(teams: Team[], roundsPlayed: number): GroupResult[] {
  const [fixedTeam, ...rotatingTeams] = teams;
  const results: GroupResult[] = [];

  for (let round = 0; round < roundsPlayed; round++) {
    const order = [fixedTeam, ...rotatingTeams];
    for (let slot = 0; slot < order.length / 2; slot++) {
      const teamA = order[slot];
      const teamB = order[order.length - 1 - slot];
      results.push({
        teamAId: teamA.id,
        teamBId: teamB.id,
        score: getSampleScore(teams.indexOf(teamA), teams.indexOf(teamB)),
      });
    }
    rotatingTeams.unshift(rotatingTeams.pop() as Team);
  }
  return results;
}

/** Sample group stage series results. Will come from the database. */
export const GROUP_RESULTS: GroupResult[] = buildSampleGroupResults(TEAMS, SAMPLE_ROUNDS_PLAYED);

export const GROUP_RECORDS: GroupRecord[] = buildGroupRecords(TEAMS, toGroupResultMap(GROUP_RESULTS));

export const MATCHES: Match[] = [
  {
    id: "g-001",
    stage: "Group stage",
    teamAId: "alpha",
    teamBId: "bravo",
    scoreA: 1,
    scoreB: 0,
    status: "played",
    startsAt: "2026-11-05T20:00:00+04:00",
  },
  {
    id: "g-002",
    stage: "Group stage",
    teamAId: "golf",
    teamBId: "lima",
    scoreA: 1,
    scoreB: 0,
    status: "played",
    startsAt: "2026-11-06T20:00:00+04:00",
  },
  {
    id: "g-003",
    stage: "Group stage",
    teamAId: "charlie",
    teamBId: "echo",
    scoreA: 0,
    scoreB: 1,
    status: "played",
    startsAt: "2026-11-07T21:00:00+04:00",
  },
  {
    id: "g-004",
    stage: "Group stage",
    teamAId: "alpha",
    teamBId: "delta",
    status: "scheduled",
    startsAt: "2026-11-14T20:00:00+04:00",
  },
  {
    id: "g-005",
    stage: "Group stage",
    teamAId: "hotel",
    teamBId: "kilo",
    status: "scheduled",
    startsAt: "2026-11-14T22:00:00+04:00",
  },
  {
    id: "g-006",
    stage: "Group stage",
    teamAId: "india",
    teamBId: "juliet",
    status: "scheduled",
    startsAt: "2026-11-15T20:00:00+04:00",
  },
];

/**
 * Returns the start time of the most recently played match: the date the standings are current as of.
 * @returns ISO date-time of the last played match, or undefined before any match is played.
 */
export function getStandingsAsOf(): string | undefined {
  return MATCHES.filter((match) => match.status === "played")
    .map((match) => match.startsAt)
    .sort()
    .at(-1);
}
