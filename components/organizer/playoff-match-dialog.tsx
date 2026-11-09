"use client";

import { type FormEvent, type Ref, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, INPUT_CLASS_NAME } from "@/components/ui/form-panel";
import { cn } from "@/lib/cn";
import {
  getPlayoffScoreOptions,
  type PlayoffMatchEntry,
  type ResolvedMatch,
  type ResolvedSlot,
} from "@/lib/league/playoffs";

interface PlayoffMatchDialogProps {
  ref: Ref<HTMLDialogElement>;
  /** The match being edited. */
  match?: ResolvedMatch;
  /** Changes every time the dialog is opened, so the form starts from the match's saved values. */
  sessionKey: string;
  onSave: (entry: PlayoffMatchEntry) => void;
}

/**
 * Modal for a playoff match: both teams with captains, a final score picker and the start date.
 * The score can only be set once both teams are known; the date can be set any time.
 */
export function PlayoffMatchDialog({ ref, match, sessionKey, onSave }: PlayoffMatchDialogProps) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="playoff-dialog-title"
      className="notch m-auto w-[calc(100%-32px)] max-w-[540px] bg-auh-ink p-0 text-auh-cream backdrop:bg-auh-ink/70"
      data-testid="playoff-match-dialog"
    >
      {match ? <PlayoffMatchForm key={sessionKey} match={match} onSave={onSave} /> : null}
    </dialog>
  );
}

function PlayoffMatchForm({ match, onSave }: { match: ResolvedMatch; onSave: (entry: PlayoffMatchEntry) => void }) {
  const [score, setScore] = useState<[number, number] | null>(
    match.scoreA !== undefined && match.scoreB !== undefined ? [match.scoreA, match.scoreB] : null,
  );
  const [dateInput, setDateInput] = useState(match.matchDate ?? "");

  const teamsKnown = Boolean(match.slotA.team && match.slotB.team);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      scoreA: score?.[0],
      scoreB: score?.[1],
      matchDate: dateInput || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
      <div>
        <h2 id="playoff-dialog-title" className="font-display text-[32px] leading-none text-auh-yellow">
          {match.id} · {match.roundName}
        </h2>
        <p className="mt-1 text-[13px] text-auh-cream-dim">Best of {match.bestOf === "Bo5" ? 5 : 3}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <SlotCard slot={match.slotA} testId="playoff-dialog-team-a" />
        <span className="font-display text-2xl text-auh-cream-dim">vs</span>
        <SlotCard slot={match.slotB} testId="playoff-dialog-team-b" />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold text-auh-cream-dim">Final score</legend>
        {teamsKnown ? (
          <div className="grid grid-cols-2 gap-2">
            {getPlayoffScoreOptions(match.bestOf).map(([scoreA, scoreB]) => {
              const isSelected = score?.[0] === scoreA && score?.[1] === scoreB;
              const winnerName = scoreA > scoreB ? match.slotA.team?.name : match.slotB.team?.name;
              return (
                <button
                  key={`${scoreA}-${scoreB}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setScore(isSelected ? null : [scoreA, scoreB])}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center border-2 px-2 py-1.5 focus-visible:outline-3 focus-visible:outline-auh-orange",
                    isSelected
                      ? "border-auh-yellow bg-auh-yellow text-auh-ink"
                      : "border-auh-ink-soft hover:border-auh-cream-dim",
                  )}
                  data-testid={`playoff-score-${scoreA}-${scoreB}`}
                >
                  <span className="font-display text-[26px] leading-none tabular-nums">
                    {scoreA}-{scoreB}
                  </span>
                  <span className="max-w-full truncate text-[11px]">{winnerName} wins</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-auh-cream-dim">The score can be entered once both teams are known.</p>
        )}
      </fieldset>

      <Field label="Match date">
        <input
          type="date"
          value={dateInput}
          onChange={(event) => setDateInput(event.target.value)}
          className={cn(INPUT_CLASS_NAME, "[color-scheme:dark]")}
          data-testid="playoff-date-input"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={!score}
          onClick={() => setScore(null)}
          className="min-h-11 px-1 text-[15px] font-semibold text-auh-orange underline disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="playoff-clear-score"
        >
          Clear score
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
            className="min-h-11 border-2 border-auh-cream-dim px-4 font-display text-xl leading-none focus-visible:outline-3 focus-visible:outline-auh-orange"
            data-testid="playoff-cancel"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" data-testid="playoff-save">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

function SlotCard({ slot, testId }: { slot: ResolvedSlot; testId: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-auh-ink-soft p-3" data-testid={testId}>
      {slot.team ? (
        <>
          <span className="truncate font-semibold">{slot.team.name}</span>
          <span className="truncate text-[13px] text-auh-cream-dim">Captain: {slot.team.captain}</span>
        </>
      ) : (
        <span className="text-auh-cream-dim">{slot.placeholder}</span>
      )}
    </div>
  );
}
