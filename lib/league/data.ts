import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseReadClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { toGroupResultMap, type GroupResultMap } from "./group-stage";
import type { PlayoffEntryMap, PlayoffMatchEntry } from "./playoffs";
import { GROUP_RESULTS, MATCHES, POINT_DEDUCTIONS, TEAMS } from "./sample-data";
import type { PointDeductionMap } from "./standings";
import type { Match, MatchStage, MatchStatus, SeriesScore, Team } from "./types";

/** Cache tag for all league data. Server Actions call `updateTag(LEAGUE_CACHE_TAG)` after writes. */
export const LEAGUE_CACHE_TAG = "league";

export interface LeagueData {
  teams: Team[];
  groupResults: GroupResultMap;
  deductions: PointDeductionMap;
  matches: Match[];
  playoffEntries: PlayoffEntryMap;
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
      groupResults: toGroupResultMap(GROUP_RESULTS),
      deductions: POINT_DEDUCTIONS,
      matches: MATCHES,
      playoffEntries: {},
    };
  }

  const supabase = getSupabaseReadClient();
  const [teamsResult, resultsResult, deductionsResult, matchesResult, playoffResult, metaResult] = await Promise.all([
    supabase.from("teams").select("id, name, captain").order("sort_order"),
    supabase.from("group_results").select("team_a_id, team_b_id, score"),
    supabase.from("point_deductions").select("team_id, points"),
    supabase.from("matches").select("*").order("starts_at"),
    supabase.from("playoff_entries").select("match_id, score_a, score_b, match_date"),
    supabase.from("league_meta").select("standings_updated_at").maybeSingle(),
  ]);

  for (const { error } of [teamsResult, resultsResult, deductionsResult, matchesResult, playoffResult, metaResult]) {
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
  }

  return {
    teams: teamsResult.data ?? [],
    groupResults: Object.fromEntries(
      (resultsResult.data ?? []).map((row) => [`${row.team_a_id}|${row.team_b_id}`, row.score as SeriesScore]),
    ),
    deductions: Object.fromEntries(
      (deductionsResult.data ?? []).map((row) => [row.team_id, { points: row.points }]),
    ),
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
    standingsUpdatedAt: metaResult.data?.standings_updated_at ?? undefined,
  };
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
