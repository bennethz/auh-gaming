"use client";

import type { Ref } from "react";
import { cn } from "@/lib/cn";
import { flipSeriesScore, SERIES_SCORES } from "@/lib/league/group-stage";
import { POINTS_PER_DRAW, POINTS_PER_WIN } from "@/lib/league/standings";
import type { SeriesScore, Team } from "@/lib/league/types";

type NumberedTeam = Team & { number: number };

interface ScoreDialogProps {
  ref: Ref<HTMLDialogElement>;
  /** Row team: the score is entered from this team's point of view. */
  team?: NumberedTeam;
  opponent?: NumberedTeam;
  /** Current score from `team`'s point of view. */
  score?: SeriesScore;
  /** Called with the chosen score, or undefined to clear the series. */
  onSelect: (score: SeriesScore | undefined) => void;
}

/**
 * Modal for entering one group stage series result, showing both teams' full names and captains.
 * Uses the native `<dialog>`: the parent opens it with `showModal()`, Escape closes it,
 * and focus returns to the grid cell that opened it.
 */
export function ScoreDialog({ ref, team, opponent, score, onSelect }: ScoreDialogProps) {
  const describeScore = (option: SeriesScore): string => {
    if (!team || !opponent) return option;
    if (option === "2-0") return `${team.name} wins · ${POINTS_PER_WIN} pts`;
    if (option === "0-2") return `${opponent.name} wins · ${POINTS_PER_WIN} pts`;
    return `Draw · ${POINTS_PER_DRAW} pt each`;
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="score-dialog-title"
      className="notch m-auto w-[calc(100%-32px)] max-w-[520px] bg-auh-ink p-0 text-auh-cream backdrop:bg-auh-ink/70"
      data-testid="score-dialog"
    >
      {team && opponent ? (
        <div className="flex flex-col gap-5 p-6">
          <h2 id="score-dialog-title" className="font-display text-[32px] leading-none text-auh-yellow">
            Enter result
          </h2>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamCard team={team} testId="score-dialog-team" />
            <span className="font-display text-2xl text-auh-cream-dim">vs</span>
            <TeamCard team={opponent} testId="score-dialog-opponent" />
          </div>

          <div role="group" aria-label={`Score for ${team.name}`} className="flex flex-col gap-2">
            {SERIES_SCORES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={score === option}
                onClick={() => onSelect(option)}
                className={cn(
                  "flex min-h-12 items-center gap-4 border-2 px-4 text-left focus-visible:outline-3 focus-visible:outline-auh-orange",
                  score === option
                    ? "border-auh-yellow bg-auh-yellow text-auh-ink"
                    : "border-auh-ink-soft hover:border-auh-cream-dim",
                )}
                data-testid={`score-option-${option}`}
              >
                <span className="w-12 font-display text-[28px] leading-none tabular-nums">{option}</span>
                <span className="text-[15px]">{describeScore(option)}</span>
              </button>
            ))}
          </div>

          <p className="text-[13px] text-auh-cream-dim">
            {opponent.name} will show {score ? flipSeriesScore(score) : "the mirrored score"} against {team.name}.
          </p>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              disabled={!score}
              onClick={() => onSelect(undefined)}
              className="min-h-11 px-1 text-[15px] font-semibold text-auh-orange underline disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="score-clear"
            >
              Clear result
            </button>
            <form method="dialog">
              <button
                type="submit"
                className="min-h-11 border-2 border-auh-cream-dim px-4 font-display text-xl leading-none focus-visible:outline-3 focus-visible:outline-auh-orange"
                data-testid="score-cancel"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function TeamCard({ team, testId }: { team: NumberedTeam; testId: string }) {
  return (
    <div className="flex flex-col gap-1 bg-auh-ink-soft p-3" data-testid={testId}>
      <span className="font-display text-lg leading-none text-auh-cream-dim">#{team.number}</span>
      <span className="font-semibold">{team.name}</span>
      <span className="text-[13px] text-auh-cream-dim">Captain: {team.captain}</span>
    </div>
  );
}
