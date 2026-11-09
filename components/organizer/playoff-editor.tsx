"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format-date";
import type { PlayoffMatchEntry, ResolvedBracket, ResolvedMatch, ResolvedSlot, SlotSide } from "@/lib/league/playoffs";
import { PlayoffMatchDialog } from "./playoff-match-dialog";

interface PlayoffEditorProps {
  brackets: ResolvedBracket[];
  /** Called with the new score and date for a match. */
  onSave: (matchId: string, entry: PlayoffMatchEntry) => void;
}

/**
 * Organizer bracket: every match card opens a dialog to set its score and date.
 * Teams and captains show as soon as they are known; winners move on automatically.
 */
export function PlayoffEditor({ brackets, onSave }: PlayoffEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<{ match: ResolvedMatch; openCount: number } | null>(null);

  const openMatch = (resolvedMatch: ResolvedMatch) => {
    setEditing((current) => ({ match: resolvedMatch, openCount: (current?.openCount ?? 0) + 1 }));
    dialogRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-9" data-testid="playoff-editor">
      {brackets.map((bracket) => (
        <div key={bracket.name} data-testid="bracket">
          <h3 className="mb-3 font-display text-4xl leading-none font-semibold">{bracket.name}</h3>
          {/* Brackets scroll inside their own wrapper so the page never scrolls sideways. */}
          <div className="overflow-x-auto pb-1.5" tabIndex={0} aria-label={`${bracket.name} rounds`} role="region">
            <ol className="flex w-max gap-6">
              {bracket.rounds.map((round) => (
                <li key={round.name} className="flex w-[230px] flex-col gap-2.5">
                  <div className="flex items-baseline justify-between border-b-3 border-auh-ink pb-1">
                    <h4 className="font-display text-2xl leading-none">{round.name}</h4>
                    <span className="text-xs font-semibold text-auh-olive">{round.bestOf}</span>
                  </div>
                  <ul className="flex flex-1 flex-col justify-around gap-3">
                    {round.matches.map((resolvedMatch) => (
                      <li key={resolvedMatch.id}>
                        <MatchCard match={resolvedMatch} onOpen={() => openMatch(resolvedMatch)} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}

      <PlayoffMatchDialog
        ref={dialogRef}
        sessionKey={editing ? `${editing.match.id}-${editing.openCount}` : "closed"}
        match={editing?.match}
        onSave={(entry) => {
          if (editing) onSave(editing.match.id, entry);
          dialogRef.current?.close();
        }}
      />
    </div>
  );
}

function MatchCard({ match, onOpen }: { match: ResolvedMatch; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Edit ${match.id}: ${match.slotA.team?.name ?? match.slotA.placeholder} vs ${match.slotB.team?.name ?? match.slotB.placeholder}`}
      className="notch focus-notch block w-full bg-auh-ink text-left text-sm text-auh-cream transition-colors hover:bg-auh-ink-soft"
      data-testid={`playoff-match-${match.id}`}
    >
      <SlotRow slot={match.slotA} score={match.scoreA} side="A" winnerSide={match.winnerSide} />
      <SlotRow slot={match.slotB} score={match.scoreB} side="B" winnerSide={match.winnerSide} />
      <span className="flex justify-between gap-2 bg-auh-ink-soft px-3.5 pt-[5px] pb-[7px] text-xs text-auh-cream-dim">
        <span className="font-semibold text-auh-yellow">{match.id}</span>
        <span>{match.matchDate ? formatCalendarDate(match.matchDate) : "Set date"}</span>
      </span>
    </button>
  );
}

function SlotRow({
  slot,
  score,
  side,
  winnerSide,
}: {
  slot: ResolvedSlot;
  score?: number;
  side: SlotSide;
  winnerSide?: SlotSide;
}) {
  const isWinner = winnerSide === side;
  const isLoser = winnerSide !== undefined && !isWinner;

  return (
    <span
      className={cn(
        "flex items-center gap-2 px-3.5 py-2",
        side === "A" && "border-b border-auh-ink-soft",
        isLoser && "opacity-55",
      )}
    >
      <span className="min-w-0 flex-1">
        {slot.team ? (
          <>
            <span className={cn("block truncate font-semibold", isWinner && "text-auh-yellow")}>{slot.team.name}</span>
            <span className="block truncate text-xs text-auh-cream-dim">Captain: {slot.team.captain}</span>
          </>
        ) : (
          <span className="block text-auh-cream-dim">{slot.placeholder}</span>
        )}
      </span>
      <span className={cn("font-display text-2xl leading-none tabular-nums", isWinner && "text-auh-yellow")}>
        {score ?? ""}
      </span>
    </span>
  );
}
