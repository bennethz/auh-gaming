"use client";

import { createContext, type ReactNode, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ResolvedMatch, ResolvedSlot } from "@/lib/league/playoffs";
import type { TeamRosterMap } from "@/lib/league/teams";
import { PlayoffRosterDialog } from "./playoff-roster-dialog";

const OpenMatchContext = createContext<((match: ResolvedMatch) => void) | null>(null);

/**
 * Holds the one players dialog for every playoff match inside it.
 * Server-rendered match cards open it through `MatchRosterButton`.
 */
export function MatchRosterProvider({ rosters, children }: { rosters: TeamRosterMap; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [match, setMatch] = useState<ResolvedMatch>();

  const openMatch = (next: ResolvedMatch) => {
    setMatch(next);
    dialogRef.current?.showModal();
  };

  return (
    <OpenMatchContext value={openMatch}>
      {children}
      <PlayoffRosterDialog ref={dialogRef} match={match} rosters={rosters} />
    </OpenMatchContext>
  );
}

interface MatchRosterButtonProps {
  match: ResolvedMatch;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * Button that opens the players dialog for a match. Adds `group` so children can react to hover.
 * Must be inside a `MatchRosterProvider`.
 */
export function MatchRosterButton({ match, children, className, ...rest }: MatchRosterButtonProps) {
  const openMatch = useContext(OpenMatchContext);
  if (!openMatch) throw new Error("MatchRosterButton must be inside a MatchRosterProvider.");

  return (
    <button
      type="button"
      onClick={() => openMatch(match)}
      aria-haspopup="dialog"
      aria-label={`See players for ${match.id}: ${slotLabel(match.slotA)} vs ${slotLabel(match.slotB)}`}
      title="See the players"
      className={cn("group cursor-pointer text-left", className)}
      data-testid={rest["data-testid"]}
    >
      {children}
    </button>
  );
}

function slotLabel(slot: ResolvedSlot): string {
  if (!slot.team) return slot.placeholder;
  return slot.seed === undefined ? slot.team.name : `#${slot.seed} ${slot.team.name}`;
}
