import type { Bracket, BracketRound, Team } from "./types";

export type BestOf = BracketRound["bestOf"];

/** What an organizer has entered for one playoff match. */
export interface PlayoffMatchEntry {
  /** Games won by the team in slot A / slot B. Both set, or both undefined. */
  scoreA?: number;
  scoreB?: number;
  /** Match day as "YYYY-MM-DD". */
  matchDate?: string;
}

/** Playoff entries keyed by bracket match id ("U1", "L3", "GF"). */
export type PlayoffEntryMap = Readonly<Record<string, PlayoffMatchEntry>>;

export type SlotSide = "A" | "B";

export interface ResolvedSlot {
  /** Original slot label, such as "Seed 3" or "Winner U1". */
  placeholder: string;
  /** The team in this slot, once known. */
  team?: Team;
}

export interface ResolvedMatch extends PlayoffMatchEntry {
  id: string;
  roundName: string;
  bestOf: BestOf;
  slotA: ResolvedSlot;
  slotB: ResolvedSlot;
  /** Set once a valid final score is entered and both teams are known. */
  winnerSide?: SlotSide;
}

export interface ResolvedBracket {
  name: string;
  rounds: Array<{ name: string; bestOf: BestOf; matches: ResolvedMatch[] }>;
}

const SLOT_PATTERN = /^(Seed|Winner|Loser) (\S+)$/;

/**
 * Games needed to win a series.
 * @param bestOf - "Bo3" or "Bo5".
 */
export function getWinsNeeded(bestOf: BestOf): number {
  return bestOf === "Bo5" ? 3 : 2;
}

/**
 * All valid final scores for a series, slot A's games first.
 * @param bestOf - "Bo3" gives 2-0, 2-1, 1-2, 0-2; "Bo5" gives 3-0 to 0-3.
 */
export function getPlayoffScoreOptions(bestOf: BestOf): Array<[scoreA: number, scoreB: number]> {
  const winsNeeded = getWinsNeeded(bestOf);
  const options: Array<[number, number]> = [];
  for (let losses = 0; losses < winsNeeded; losses++) options.push([winsNeeded, losses]);
  for (let losses = winsNeeded - 1; losses >= 0; losses--) options.push([losses, winsNeeded]);
  return options;
}

/**
 * Which slot won, based on the entered score.
 * @returns "A" or "B", or undefined when no valid final score is entered.
 */
export function getWinnerSide(bestOf: BestOf, entry: PlayoffMatchEntry | undefined): SlotSide | undefined {
  const winsNeeded = getWinsNeeded(bestOf);
  if (entry?.scoreA === winsNeeded && (entry.scoreB ?? winsNeeded) < winsNeeded) return "A";
  if (entry?.scoreB === winsNeeded && (entry.scoreA ?? winsNeeded) < winsNeeded) return "B";
  return undefined;
}

/**
 * Fills every bracket slot with a team where possible: seeds from the group stage order,
 * then winners and losers of earlier matches as their scores are entered.
 * Brackets must be listed so every match comes after the matches it depends on
 * (upper bracket, lower bracket, grand final), as `buildPlayoffBrackets` returns them.
 * @param brackets - Brackets with placeholder slots.
 * @param seededTeams - Teams in group stage order; index 0 is seed 1.
 * @param entries - Entered scores and dates.
 */
export function resolvePlayoffs(brackets: Bracket[], seededTeams: Team[], entries: PlayoffEntryMap): ResolvedBracket[] {
  const outcomes = new Map<string, { winner?: Team; loser?: Team }>();

  const resolveSlot = (placeholder: string): ResolvedSlot => {
    const slotMatch = SLOT_PATTERN.exec(placeholder);
    if (!slotMatch) return { placeholder };
    const [, kind, reference] = slotMatch;
    if (kind === "Seed") return { placeholder, team: seededTeams[Number(reference) - 1] };
    const outcome = outcomes.get(reference);
    return { placeholder, team: kind === "Winner" ? outcome?.winner : outcome?.loser };
  };

  return brackets.map((bracket) => ({
    name: bracket.name,
    rounds: bracket.rounds.map((round) => ({
      name: round.name,
      bestOf: round.bestOf,
      matches: round.matches.map((bracketMatch) => {
        const slotA = resolveSlot(bracketMatch.slotA);
        const slotB = resolveSlot(bracketMatch.slotB);
        const entry = entries[bracketMatch.id];
        const winnerSide = slotA.team && slotB.team ? getWinnerSide(round.bestOf, entry) : undefined;

        outcomes.set(
          bracketMatch.id,
          winnerSide === "A"
            ? { winner: slotA.team, loser: slotB.team }
            : winnerSide === "B"
              ? { winner: slotB.team, loser: slotA.team }
              : {},
        );

        return { ...entry, id: bracketMatch.id, roundName: round.name, bestOf: round.bestOf, slotA, slotB, winnerSide };
      }),
    })),
  }));
}

/**
 * Finds a resolved match by id.
 * @param brackets - Resolved brackets.
 * @param matchId - Bracket match id, such as "U1".
 */
export function findResolvedMatch(brackets: ResolvedBracket[], matchId: string): ResolvedMatch | undefined {
  for (const bracket of brackets) {
    for (const round of bracket.rounds) {
      const found = round.matches.find((resolvedMatch) => resolvedMatch.id === matchId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Saves one match's entry. If the match's winner changes, scores of every later match that the
 * winner or loser feeds into are cleared, because those matches now involve different teams.
 * Dates are kept.
 * @param brackets - Bracket structure, used to find dependent matches.
 * @param entries - Current entries.
 * @param matchId - The match being saved.
 * @param entry - The new score and date.
 */
export function savePlayoffEntry(
  brackets: Bracket[],
  entries: PlayoffEntryMap,
  matchId: string,
  entry: PlayoffMatchEntry,
): PlayoffEntryMap {
  const allMatches = brackets.flatMap((bracket) =>
    bracket.rounds.flatMap((round) => round.matches.map((bracketMatch) => ({ ...bracketMatch, bestOf: round.bestOf }))),
  );
  const bestOf = allMatches.find((bracketMatch) => bracketMatch.id === matchId)?.bestOf ?? "Bo3";
  const next: Record<string, PlayoffMatchEntry> = { ...entries, [matchId]: entry };

  if (getWinnerSide(bestOf, entries[matchId]) === getWinnerSide(bestOf, entry)) return next;

  const clearDependents = (sourceId: string) => {
    for (const bracketMatch of allMatches) {
      const feedsFromSource = [bracketMatch.slotA, bracketMatch.slotB].some(
        (slot) => slot === `Winner ${sourceId}` || slot === `Loser ${sourceId}`,
      );
      if (!feedsFromSource) continue;
      const dependent = next[bracketMatch.id];
      if (dependent?.scoreA !== undefined || dependent?.scoreB !== undefined) {
        next[bracketMatch.id] = { matchDate: dependent.matchDate };
      }
      clearDependents(bracketMatch.id);
    }
  };
  clearDependents(matchId);
  return next;
}
