import type { Team } from "./types";

/** Player classes, in display order. "Captain" leads the team; S to C rank the other players. */
export const PLAYER_CLASSES = ["Captain", "S", "A", "B", "C"] as const;

export type PlayerClass = (typeof PLAYER_CLASSES)[number];

export const PLAYER_CLASS_LABELS: Record<PlayerClass, string> = {
  Captain: "Captain",
  S: "Class S",
  A: "Class A",
  B: "Class B",
  C: "Class C",
};

export const MAX_TEAM_NAME_LENGTH = 40;
export const MAX_PLAYER_NAME_LENGTH = 32;

export interface Player {
  id: string;
  name: string;
  playerClass: PlayerClass;
}

/** Each team's players in roster order, keyed by team id. Teams with no players may be missing. */
export type TeamRosterMap = Record<string, Player[]>;

export function isPlayerClass(value: unknown): value is PlayerClass {
  return typeof value === "string" && (PLAYER_CLASSES as readonly string[]).includes(value);
}

/**
 * The name of the roster's captain.
 * @returns The first Captain-class player's name, or an empty string if the roster has no captain.
 */
export function getCaptainName(roster: Player[] | undefined): string {
  return roster?.find((player) => player.playerClass === "Captain")?.name.trim() ?? "";
}

/**
 * Fills in a roster for teams that have a captain name stored but no players yet (data from before
 * rosters existed), so the existing captain shows up as a Captain-class player. Ids are deterministic
 * so the result is stable between renders.
 */
export function withCaptainFallback(teams: Team[], rosters: TeamRosterMap): TeamRosterMap {
  const next: TeamRosterMap = { ...rosters };
  for (const team of teams) {
    if ((next[team.id]?.length ?? 0) > 0 || !team.captain) continue;
    next[team.id] = [{ id: `${team.id}-captain`, name: team.captain, playerClass: "Captain" }];
  }
  return next;
}

/**
 * Rosters for just the playoff teams, to send to the browser for the match players dialog.
 * Teams with no players but a stored captain show that captain.
 */
export function getPlayoffRosters(playoffTeams: Team[], rosters: TeamRosterMap): TeamRosterMap {
  const withFallback = withCaptainFallback(playoffTeams, rosters);
  return Object.fromEntries(playoffTeams.map((team) => [team.id, withFallback[team.id] ?? []]));
}

/** Teams with each captain taken from its roster. */
export function applyRosterCaptains(teams: Team[], rosters: TeamRosterMap): Team[] {
  return teams.map((team) => ({ ...team, captain: getCaptainName(rosters[team.id]) }));
}

/** Problems that block saving, keyed by team id. */
export type TeamErrorMap = Record<string, string[]>;

/**
 * Checks team names and rosters: every team needs a unique, non-empty name, every player a name,
 * and each team at most one captain.
 * @returns Error messages by team id. Empty when everything is valid.
 */
export function validateTeams(teams: Team[], rosters: TeamRosterMap): TeamErrorMap {
  const errors: TeamErrorMap = {};
  const add = (teamId: string, message: string) => {
    (errors[teamId] ??= []).push(message);
  };

  const nameCounts = new Map<string, number>();
  for (const team of teams) {
    const key = team.name.trim().toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  for (const team of teams) {
    const name = team.name.trim();
    if (!name) add(team.id, "Enter a team name.");
    else if ((nameCounts.get(name.toLowerCase()) ?? 0) > 1) add(team.id, "Another team already has this name.");

    const roster = rosters[team.id] ?? [];
    if (roster.some((player) => !player.name.trim())) add(team.id, "Every player needs a name.");
    if (roster.filter((player) => player.playerClass === "Captain").length > 1) {
      add(team.id, "A team can only have one captain.");
    }
  }
  return errors;
}
