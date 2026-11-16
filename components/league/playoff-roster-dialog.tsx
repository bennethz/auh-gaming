"use client";

import type { Ref } from "react";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format-date";
import type { ResolvedMatch, ResolvedSlot, SlotSide } from "@/lib/league/playoffs";
import { PLAYER_CLASS_LABELS, PLAYER_CLASSES, type Player, type TeamRosterMap } from "@/lib/league/teams";
import { CrownIcon } from "@/components/ui/crown-icon";
import { SeedNumber } from "./seed-number";

interface PlayoffRosterDialogProps {
  ref: Ref<HTMLDialogElement>;
  /** The match whose teams are shown. */
  match?: ResolvedMatch;
  /** Players keyed by team id. */
  rosters: TeamRosterMap;
}

/**
 * Read-only modal listing the players of both teams in a playoff match, captain first, then by class.
 * Uses the native `<dialog>`: the parent opens it with `showModal()`; Escape, Close or a backdrop click closes it.
 */
export function PlayoffRosterDialog({ ref, match, rosters }: PlayoffRosterDialogProps) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="roster-dialog-title"
      // The dialog never grows past the screen; only the rosters scroll, so the title and Close stay visible.
      className="notch fixed inset-0 m-auto h-fit max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[640px] overflow-hidden border-t-4 border-auh-yellow bg-auh-ink p-0 text-auh-cream backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      data-testid="playoff-roster-dialog"
    >
      {match ? (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
            <h2
              id="roster-dialog-title"
              className="font-display text-2xl leading-none text-auh-yellow sm:text-[32px]"
            >
              {match.id} · {match.roundName}
            </h2>
            <p className="mt-1 text-[13px] text-auh-cream-dim">
              Best of {match.bestOf === "Bo5" ? 5 : 3} ·{" "}
              {match.matchDate ? formatCalendarDate(match.matchDate) : "Date to be set"}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6 sm:pb-0">
            <div className="grid items-start gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
              <TeamRoster slot={match.slotA} side="A" match={match} rosters={rosters} />
              {/* Stacked on phones: a thin divider. Side by side: a large "vs" between the columns. */}
              <span aria-hidden="true" className="flex items-center gap-2 sm:self-center">
                <span className="h-px flex-1 bg-auh-ink-soft sm:hidden" />
                <span className="font-display text-sm leading-none tracking-wider text-auh-cream-dim sm:text-2xl sm:tracking-normal">
                  VS
                </span>
                <span className="h-px flex-1 bg-auh-ink-soft sm:hidden" />
              </span>
              <TeamRoster slot={match.slotB} side="B" match={match} rosters={rosters} />
            </div>
          </div>

          <div className="flex justify-end border-t border-auh-ink-soft px-4 py-3 sm:border-0 sm:px-6 sm:pt-4 sm:pb-6">
            <button
              type="button"
              autoFocus
              onClick={(event) => event.currentTarget.closest("dialog")?.close()}
              className="min-h-11 w-full border-2 border-auh-cream-dim px-4 font-display text-xl leading-none focus-visible:outline-3 focus-visible:outline-auh-orange sm:w-auto"
              data-testid="roster-dialog-close"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function TeamRoster({
  slot,
  side,
  match,
  rosters,
}: {
  slot: ResolvedSlot;
  side: SlotSide;
  match: ResolvedMatch;
  rosters: TeamRosterMap;
}) {
  const testId = `roster-dialog-team-${side.toLowerCase()}`;

  if (!slot.team) {
    return (
      <section className="flex flex-col gap-1 bg-auh-ink-soft p-3 sm:p-4" data-testid={testId}>
        <h3 className="font-semibold text-auh-cream-dim">{slot.placeholder}</h3>
        <p className="text-[13px] text-auh-cream-dim">Team not decided yet.</p>
      </section>
    );
  }

  const score = side === "A" ? match.scoreA : match.scoreB;
  const isWinner = match.winnerSide === side;
  const players = sortByClass(rosters[slot.team.id] ?? []);

  return (
    <section className="flex min-w-0 flex-col gap-2 bg-auh-ink-soft p-3 sm:gap-3 sm:p-4" data-testid={testId}>
      <h3 className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <SeedNumber seed={slot.seed} />
          <span className={cn("truncate font-semibold", isWinner && "text-auh-yellow")}>{slot.team.name}</span>
        </span>
        {score !== undefined ? (
          <span className={cn("font-display text-2xl leading-none tabular-nums", isWinner && "text-auh-yellow")}>
            {score}
          </span>
        ) : null}
      </h3>

      {players.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm" aria-label={`${slot.team.name} players`}>
          {players.map((player) => (
            <li key={player.id} className="flex items-center gap-2">
              <ClassBadge player={player} />
              <span className="min-w-0 truncate">{player.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-auh-cream-dim">No players listed yet.</p>
      )}
    </section>
  );
}

/** Small fixed-width tag with the player's class; a crown for the captain. */
function ClassBadge({ player }: { player: Player }) {
  const label = PLAYER_CLASS_LABELS[player.playerClass];
  return (
    <span
      className="flex h-6 w-7 shrink-0 items-center justify-center bg-auh-ink text-xs font-semibold text-auh-yellow"
      title={label}
    >
      {player.playerClass === "Captain" ? (
        <CrownIcon className="size-3.5" />
      ) : (
        <span aria-hidden="true">{player.playerClass}</span>
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Captain first, then S to C, keeping roster order within a class. */
function sortByClass(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) => PLAYER_CLASSES.indexOf(a.playerClass) - PLAYER_CLASSES.indexOf(b.playerClass),
  );
}
