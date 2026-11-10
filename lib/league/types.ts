/** How group stage finishers are split across the playoff brackets. */
export type PlayoffFormat = "8-upper-8-lower";

/** Where a team goes after the group stage. */
export type PlayoffPath = "Upper" | "Lower";

export type MatchStage = "Group stage" | "Upper bracket" | "Lower bracket" | "Grand final";

export type MatchStatus = "played" | "scheduled";

export interface Team {
  id: string;
  name: string;
  captain: string;
}

/**
 * Result of a best-of-two group stage series, from the first team's point of view:
 * "2-0" is a win, "1-1" a draw and "0-2" a loss. "DW" is a default win (the opponent
 * forfeited or didn't show) and "DL" the matching default loss.
 */
export type SeriesScore = "2-0" | "1-1" | "0-2" | "DW" | "DL";

/** One played group stage series. */
export interface GroupResult {
  teamAId: string;
  teamBId: string;
  /** Score from team A's point of view. */
  score: SeriesScore;
}

/** A team's group stage record, before ranking. */
export interface GroupRecord {
  teamId: string;
  played: number;
  /** Series won 2-0 on the server. */
  wins: number;
  /** Series won by default. */
  defaultWins: number;
  draws: number;
}

/** Points taken off a team's group stage total by the organizers. */
export interface PointDeduction {
  /** Points deducted, as a positive number. */
  points: number;
}

export interface StandingRow {
  rank: number;
  team: Team;
  played: number;
  /** All series won, including default wins. */
  wins: number;
  /** Of `wins`, how many were default wins. */
  defaultWins: number;
  draws: number;
  losses: number;
  /** Net points, after any deduction. */
  points: number;
  deduction?: PointDeduction;
  path: PlayoffPath;
}

export interface Match {
  id: string;
  stage: MatchStage;
  teamAId: string;
  teamBId: string;
  /** Games won by each side. Undefined until the match is played. */
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  /** Start time as an ISO 8601 string with offset (Gulf Standard Time). */
  startsAt: string;
}

export interface BracketMatch {
  id: string;
  /** Slot label, such as "Seed 1" or "Winner U1", until teams are known. */
  slotA: string;
  slotB: string;
}

export interface BracketRound {
  name: string;
  bestOf: "Bo3" | "Bo5";
  matches: BracketMatch[];
}

export interface Bracket {
  name: string;
  rounds: BracketRound[];
}
