import type { GroupRecord, PlayoffFormat, PlayoffPath, PointDeduction, StandingRow, Team } from "./types";

/** Points for a 2-0 series win. */
export const POINTS_PER_WIN = 4;
/** Points for a default win. */
export const POINTS_PER_DEFAULT_WIN = 2;
/** Points for a 1-1 series draw. A 0-2 loss or a default loss scores nothing. */
export const POINTS_PER_DRAW = 1;

/** Point deductions keyed by team id. */
export type PointDeductionMap = Readonly<Record<string, PointDeduction>>;

/**
 * Group stage points for a record, after any deduction. Can go below zero.
 * @param record - Wins, default wins and draws.
 * @param deductedPoints - Points taken off by the organizers.
 */
export function getPoints(record: Pick<GroupRecord, "wins" | "defaultWins" | "draws">, deductedPoints = 0): number {
  return (
    record.wins * POINTS_PER_WIN +
    record.defaultWins * POINTS_PER_DEFAULT_WIN +
    record.draws * POINTS_PER_DRAW -
    deductedPoints
  );
}

interface FormatRules {
  /** Short sentence explaining where teams go after the group stage. */
  summary: string;
  legend: Array<{ path: PlayoffPath; label: string }>;
}

export const FORMAT_RULES: Record<PlayoffFormat, FormatRules> = {
  "8-upper-8-lower": {
    summary: "Top 8 go to the upper bracket, 9th to 16th to the lower bracket.",
    legend: [
      { path: "Upper", label: "1 to 8: Upper bracket" },
      { path: "Lower", label: "9 to 16: Lower bracket" },
    ],
  },
};

/**
 * Returns which playoff bracket a group stage rank qualifies for.
 * @param rank - Final group stage position, starting at 1.
 * @param format - The season's playoff format.
 */
export function getPlayoffPath(rank: number, format: PlayoffFormat): PlayoffPath {
  const upperBracketSize = { "8-upper-8-lower": 8 }[format];
  return rank <= upperBracketSize ? "Upper" : "Lower";
}

/**
 * Ranks group stage records by net points (most first) and attaches team details.
 * Ties keep their input order until a tiebreaker rule is agreed.
 * @param records - Group stage records, one per team.
 * @param teams - All teams in the season.
 * @param format - The season's playoff format, used to mark each team's path.
 * @param deductions - Point deductions keyed by team id.
 * @returns Standings sorted by rank.
 * @throws Error if a record references an unknown team.
 */
export function buildStandings(
  records: GroupRecord[],
  teams: Team[],
  format: PlayoffFormat,
  deductions: PointDeductionMap = {},
): StandingRow[] {
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  return records
    .map((record) => ({ record, points: getPoints(record, deductions[record.teamId]?.points) }))
    .sort((first, second) => second.points - first.points)
    .map(({ record, points }, index) => {
      const team = teamsById.get(record.teamId);
      if (!team) {
        throw new Error(`Unknown team id in group records: ${record.teamId}`);
      }
      const rank = index + 1;
      return {
        rank,
        team,
        played: record.played,
        wins: record.wins + record.defaultWins,
        defaultWins: record.defaultWins,
        draws: record.draws,
        losses: record.played - record.wins - record.defaultWins - record.draws,
        points,
        deduction: deductions[record.teamId],
        path: getPlayoffPath(rank, format),
      };
    });
}
