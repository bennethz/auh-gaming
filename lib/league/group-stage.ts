import type { GroupRecord, GroupResult, SeriesScore, Team } from "./types";

/** Played scores an organizer can enter for a series, from the row team's point of view. */
export const SERIES_SCORES: readonly SeriesScore[] = ["2-0", "1-1", "0-2"];

/** Default results: the row team wins by default ("DW") or loses by default ("DL"). */
export const DEFAULT_SCORES: readonly SeriesScore[] = ["DW", "DL"];

/**
 * Group stage results keyed by team pair. Each pair is stored once, from the
 * point of view of the team whose id sorts first; read it with `getSeriesScore`.
 */
export type GroupResultMap = Readonly<Record<string, SeriesScore>>;

function getPairKey(teamId: string, opponentId: string): string {
  return teamId < opponentId ? `${teamId}|${opponentId}` : `${opponentId}|${teamId}`;
}

/**
 * Returns the same series result from the other team's point of view.
 * @param score - Score from one team's point of view.
 */
export function flipSeriesScore(score: SeriesScore): SeriesScore {
  const flipped: Record<SeriesScore, SeriesScore> = { "2-0": "0-2", "0-2": "2-0", "1-1": "1-1", DW: "DL", DL: "DW" };
  return flipped[score];
}

/**
 * Reads a series result from one team's point of view.
 * @param results - All group stage results.
 * @param teamId - The team whose score comes first.
 * @param opponentId - The other team.
 * @returns The score, or undefined if the series hasn't been entered.
 */
export function getSeriesScore(results: GroupResultMap, teamId: string, opponentId: string): SeriesScore | undefined {
  const stored = results[getPairKey(teamId, opponentId)];
  if (!stored) return undefined;
  return teamId < opponentId ? stored : flipSeriesScore(stored);
}

/**
 * Returns a copy of the results with one series set or cleared.
 * Setting Alpha vs Bravo to "2-0" also makes Bravo vs Alpha read "0-2".
 * @param results - Current results.
 * @param teamId - The team whose score comes first.
 * @param opponentId - The other team.
 * @param score - New score from `teamId`'s point of view, or undefined to clear the series.
 * @throws Error if a team is paired with itself.
 */
export function setSeriesScore(
  results: GroupResultMap,
  teamId: string,
  opponentId: string,
  score: SeriesScore | undefined,
): GroupResultMap {
  if (teamId === opponentId) {
    throw new Error(`A team can't play itself: ${teamId}`);
  }
  const key = getPairKey(teamId, opponentId);
  const next = { ...results };
  if (score) {
    next[key] = teamId < opponentId ? score : flipSeriesScore(score);
  } else {
    delete next[key];
  }
  return next;
}

/**
 * Converts a list of played series into a result map.
 * @param results - Played series.
 */
export function toGroupResultMap(results: GroupResult[]): GroupResultMap {
  return results.reduce<GroupResultMap>(
    (map, result) => setSeriesScore(map, result.teamAId, result.teamBId, result.score),
    {},
  );
}

/**
 * Totals each team's played, won (on the server and by default) and drawn series from the results.
 * @param teams - All teams in the group.
 * @param results - All group stage results.
 * @returns One record per team, in team order.
 */
export function buildGroupRecords(teams: Team[], results: GroupResultMap): GroupRecord[] {
  return teams.map((team) => {
    const record: GroupRecord = { teamId: team.id, played: 0, wins: 0, defaultWins: 0, draws: 0 };
    for (const opponent of teams) {
      if (opponent.id === team.id) continue;
      const score = getSeriesScore(results, team.id, opponent.id);
      if (!score) continue;
      record.played += 1;
      if (score === "2-0") record.wins += 1;
      if (score === "DW") record.defaultWins += 1;
      if (score === "1-1") record.draws += 1;
    }
    return record;
  });
}

/**
 * Number of series in a single round robin.
 * @param teamCount - Teams in the group.
 */
export function getTotalSeriesCount(teamCount: number): number {
  return (teamCount * (teamCount - 1)) / 2;
}

/**
 * Number of series entered so far.
 * @param results - All group stage results.
 */
export function getPlayedSeriesCount(results: GroupResultMap): number {
  return Object.keys(results).length;
}
