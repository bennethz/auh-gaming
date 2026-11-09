import type { Bracket, BracketMatch, BracketRound, PlayoffFormat } from "./types";

const seed = (position: number) => `Seed ${position}`;
const winnerOf = (matchId: string) => `Winner ${matchId}`;
const loserOf = (matchId: string) => `Loser ${matchId}`;

const match = (id: string, slotA: string, slotB: string): BracketMatch => ({ id, slotA, slotB });

const bestOfThree = (name: string, matches: BracketMatch[]): BracketRound => ({
  name,
  bestOf: "Bo3",
  matches,
});

function buildEightUpperEightLower(): Bracket[] {
  return [
    {
      name: "Upper bracket",
      rounds: [
        bestOfThree("Quarterfinals", [
          match("U1", seed(1), seed(8)),
          match("U2", seed(4), seed(5)),
          match("U3", seed(2), seed(7)),
          match("U4", seed(3), seed(6)),
        ]),
        bestOfThree("Semifinals", [
          match("U5", winnerOf("U1"), winnerOf("U2")),
          match("U6", winnerOf("U3"), winnerOf("U4")),
        ]),
        bestOfThree("Upper final", [match("U7", winnerOf("U5"), winnerOf("U6"))]),
      ],
    },
    {
      name: "Lower bracket",
      rounds: [
        bestOfThree("Round 1", [
          match("L1", seed(9), seed(16)),
          match("L2", seed(12), seed(13)),
          match("L3", seed(10), seed(15)),
          match("L4", seed(11), seed(14)),
        ]),
        bestOfThree("Round 2", [
          match("L5", winnerOf("L1"), loserOf("U4")),
          match("L6", winnerOf("L2"), loserOf("U3")),
          match("L7", winnerOf("L3"), loserOf("U2")),
          match("L8", winnerOf("L4"), loserOf("U1")),
        ]),
        bestOfThree("Round 3", [
          match("L9", winnerOf("L5"), winnerOf("L6")),
          match("L10", winnerOf("L7"), winnerOf("L8")),
        ]),
        bestOfThree("Round 4", [
          match("L11", winnerOf("L9"), loserOf("U6")),
          match("L12", winnerOf("L10"), loserOf("U5")),
        ]),
        bestOfThree("Round 5", [match("L13", winnerOf("L11"), winnerOf("L12"))]),
        bestOfThree("Lower final", [match("L14", winnerOf("L13"), loserOf("U7"))]),
      ],
    },
    {
      name: "Grand final",
      rounds: [
        { name: "Grand final", bestOf: "Bo5", matches: [match("GF", winnerOf("U7"), winnerOf("L14"))] },
      ],
    },
  ];
}

/**
 * Builds the double elimination playoff brackets with placeholder slots.
 * Slots fill in with team names once the group stage ends.
 * @param format - The season's playoff format.
 * @returns Upper bracket, lower bracket and grand final, in that order.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept so a new format can be added without changing callers.
export function buildPlayoffBrackets(format: PlayoffFormat): Bracket[] {
  return buildEightUpperEightLower();
}
