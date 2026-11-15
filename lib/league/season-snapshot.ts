import "server-only";
import { buildPlayoffBrackets } from "./bracket";
import { getLeagueData, getStandingsAsOf } from "./data";
import { buildGroupRecords } from "./group-stage";
import {
  getChampion,
  getSeededTeams,
  getUpcomingPlayoffMatches,
  resolvePlayoffs,
  type ResolvedMatch,
} from "./playoffs";
import { SEASON } from "./sample-data";
import { buildStandings } from "./standings";
import type { StandingRow, Team } from "./types";

/** A ready-to-play playoff match with the name of the bracket it belongs to. */
export interface FeaturedMatch {
  bracketName: string;
  match: ResolvedMatch;
}

/** Everything the home page shows about the current season, derived from the league data. */
export interface SeasonSnapshot {
  standings: StandingRow[];
  /** When the standings are current as of (ISO date-time), during the group stage. */
  asOf?: string;
  /** True once the organizers have generated the playoffs, which ends the group stage. */
  isPlayoffsLive: boolean;
  /** The next playoff match to feature: the earliest dated one, otherwise the first in bracket order. */
  nextMatch?: FeaturedMatch;
  /** Every other ready-to-play playoff match, in date order (undated last). */
  laterMatches: FeaturedMatch[];
  /** The grand final winner, once the grand final has a result. */
  champion?: Team;
}

const UNDATED = "9999-12-31";

/**
 * Builds the home page's view of the current season: standings, the next playoff games and the champion.
 */
export async function getSeasonSnapshot(): Promise<SeasonSnapshot> {
  const leagueData = await getLeagueData();
  const { teams, groupResults, deductions, tiebreakOrder, playoffEntries, playoffSeeds } = leagueData;
  const standings = buildStandings(
    buildGroupRecords(teams, groupResults),
    teams,
    SEASON.playoffFormat,
    deductions,
    tiebreakOrder,
  );
  // Generating the playoffs freezes the seeds, which ends the group stage.
  const isPlayoffsLive = playoffSeeds.length > 0;
  if (!isPlayoffsLive) {
    return { standings, asOf: getStandingsAsOf(leagueData), isPlayoffsLive, laterMatches: [] };
  }

  const brackets = resolvePlayoffs(
    buildPlayoffBrackets(SEASON.playoffFormat),
    getSeededTeams(playoffSeeds, teams),
    playoffEntries,
  );
  // Stable sort keeps bracket order for matches on the same day or without a date.
  const upcoming = getUpcomingPlayoffMatches(brackets)
    .flatMap((group) => group.matches.map((match) => ({ bracketName: group.name, match })))
    .sort((a, b) => (a.match.matchDate ?? UNDATED).localeCompare(b.match.matchDate ?? UNDATED));

  const champion = getChampion(brackets);

  return {
    standings,
    isPlayoffsLive,
    nextMatch: upcoming[0],
    laterMatches: upcoming.slice(1),
    champion,
  };
}
