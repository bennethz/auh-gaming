import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseReadClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { toGroupResultMap, type GroupResultMap } from "./group-stage";
import type { PlayoffEntryMap, PlayoffMatchEntry, PlayoffSeeds } from "./playoffs";
import { GROUP_RESULTS, MATCHES, POINT_DEDUCTIONS, TEAMS } from "./sample-data";
import type { PointDeductionMap, TiebreakOrder } from "./standings";
import { isPlayerClass, type Player, type TeamRosterMap } from "./teams";
import type { Match, MatchStage, MatchStatus, SeriesScore, Team } from "./types";

/** Cache tag for all league data. Server Actions call `updateTag(LEAGUE_CACHE_TAG)` after writes. */
export const LEAGUE_CACHE_TAG = "league";

export interface LeagueData {
  teams: Team[];
  /** Each team's players in roster order, keyed by team id. */
  rosters: TeamRosterMap;
  groupResults: GroupResultMap;
  deductions: PointDeductionMap;
  /** Manual order for teams level on points, highest first. Empty until an organizer sets it. */
  tiebreakOrder: TiebreakOrder;
  matches: Match[];
  playoffEntries: PlayoffEntryMap;
  /** Seeds frozen when the playoffs were generated. Empty until then. */
  playoffSeeds: PlayoffSeeds;
  /** When an organizer last saved, as an ISO 8601 date-time. Undefined until the first save. */
  standingsUpdatedAt?: string;
}

/**
 * Loads the current season's league data from Supabase, cached until an organizer saves.
 * Falls back to the static sample data when Supabase isn't configured.
 * @throws Error if a Supabase query fails.
 */
export async function getLeagueData(): Promise<LeagueData> {
  "use cache";
  cacheTag(LEAGUE_CACHE_TAG);
  cacheLife("hours");

  if (!isSupabaseConfigured) {
    return {
      teams: TEAMS,
      rosters: {},
      groupResults: toGroupResultMap(GROUP_RESULTS),
      deductions: POINT_DEDUCTIONS,
      tiebreakOrder: [],
      matches: MATCHES,
      playoffEntries: {},
      playoffSeeds: [],
    };
  }

  const supabase = getSupabaseReadClient();
  const [
    teamsResult,
    resultsResult,
    deductionsResult,
    tiebreakResult,
    matchesResult,
    playoffResult,
    seedsResult,
    metaResult,
    playersResult,
  ] = await Promise.all([
      supabase.from("teams").select("id, name, captain").order("sort_order"),
      supabase.from("group_results").select("team_a_id, team_b_id, score"),
      supabase.from("point_deductions").select("team_id, points"),
      supabase.from("tiebreak_order").select("team_id").order("position"),
      supabase.from("matches").select("*").order("starts_at"),
      supabase.from("playoff_entries").select("match_id, score_a, score_b, match_date"),
      supabase.from("playoff_seeds").select("team_id").order("seed"),
      supabase.from("league_meta").select("standings_updated_at").maybeSingle(),
      supabase.from("players").select("id, team_id, name, class").order("position"),
    ]);

  for (const { error } of [
    teamsResult,
    resultsResult,
    deductionsResult,
    tiebreakResult,
    matchesResult,
    playoffResult,
    metaResult,
  ]) {
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
  }
  // playoff_seeds comes from migration 0004. Until it's run, treat the playoffs as not generated
  // instead of taking the whole site down.
  if (seedsResult.error && !isMissingTableError(seedsResult.error)) {
    throw new Error(`Supabase query failed: ${seedsResult.error.message}`);
  }
  // players comes from migration 0005. Until it's run, teams just have no rosters.
  if (playersResult.error && !isMissingTableError(playersResult.error)) {
    throw new Error(`Supabase query failed: ${playersResult.error.message}`);
  }
  const rosters: TeamRosterMap = {};
  for (const row of playersResult.data ?? []) {
    const player: Player = { id: row.id, name: row.name, playerClass: isPlayerClass(row.class) ? row.class : "C" };
    (rosters[row.team_id] ??= []).push(player);
  }

  return {
    teams: teamsResult.data ?? [],
    rosters,
    groupResults: Object.fromEntries(
      (resultsResult.data ?? []).map((row) => [`${row.team_a_id}|${row.team_b_id}`, row.score as SeriesScore]),
    ),
    deductions: Object.fromEntries(
      (deductionsResult.data ?? []).map((row) => [row.team_id, { points: row.points }]),
    ),
    tiebreakOrder: (tiebreakResult.data ?? []).map((row) => row.team_id),
    matches: (matchesResult.data ?? []).map((row) => ({
      id: row.id,
      stage: row.stage as MatchStage,
      teamAId: row.team_a_id,
      teamBId: row.team_b_id,
      scoreA: row.score_a ?? undefined,
      scoreB: row.score_b ?? undefined,
      status: row.status as MatchStatus,
      startsAt: row.starts_at,
    })),
    playoffEntries: Object.fromEntries(
      (playoffResult.data ?? []).map((row): [string, PlayoffMatchEntry] => [
        row.match_id,
        {
          scoreA: row.score_a ?? undefined,
          scoreB: row.score_b ?? undefined,
          matchDate: row.match_date ?? undefined,
        },
      ]),
    ),
    playoffSeeds: (seedsResult.data ?? []).map((row) => row.team_id),
    standingsUpdatedAt: metaResult.data?.standings_updated_at ?? undefined,
  };
}

/**
 * True when a Supabase error means the table doesn't exist yet (its migration hasn't been run).
 * PGRST205: PostgREST can't find the table. 42P01: Postgres "relation does not exist".
 */
export function isMissingTableError(error: { code?: string }): boolean {
  return error.code === "PGRST205" || error.code === "42P01";
}

/**
 * The date the standings are current as of: when an organizer last saved, or, before the first save,
 * the start time of the most recently played match.
 * @param data - League data with the last save time and all matches.
 * @returns ISO date-time, or undefined before any save or played match.
 */
export function getStandingsAsOf({
  standingsUpdatedAt,
  matches,
}: Pick<LeagueData, "standingsUpdatedAt" | "matches">): string | undefined {
  if (standingsUpdatedAt) return standingsUpdatedAt;
  return matches
    .filter((match) => match.status === "played")
    .map((match) => match.startsAt)
    .sort()
    .at(-1);
}
